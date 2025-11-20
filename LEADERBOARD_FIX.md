# 🏆 Correction Classement - Meilleur Score

## 🐛 Problème Identifié

### Symptômes
- ❌ Classement "Jour" affichait le **dernier score** joué
- ❌ Classement "Semaine" affichait le **dernier score** joué
- ✅ Classement "Tout temps" affichait correctement le **meilleur score**

### Cause Racine
Dans `src/services/leaderboard.ts`, la méthode `saveScore()` utilisait `{ merge: true }` pour les classements quotidiens et hebdomadaires, ce qui **écrasait** le score existant par le dernier score sans comparer.

```typescript
// ❌ CODE PROBLÉMATIQUE (AVANT)
await firestore()
  .collection(this.COLLECTION)
  .doc(`daily_${today}_${mode}_${userId}`)
  .set({
    ...baseData,
    [modeScoreField]: score,  // ❌ Écrase avec dernier score
    globalScore: globalPoints,
    ...
  }, { merge: true });
```

---

## ✅ Solution Implémentée

### Modifications Apportées

#### 1. **Classement Quotidien (Daily)**
```typescript
// ✅ NOUVEAU CODE (APRÈS)
const dailyDocId = `daily_${today}_${mode}_${userId}`;
const dailyDoc = await firestore()
  .collection(this.COLLECTION)
  .doc(dailyDocId)
  .get();

const dailyData = dailyDoc.exists() ? dailyDoc.data() : null;
const currentDailyScore = dailyData?.[modeScoreField] || 0;
const currentDailyGlobal = dailyData?.globalScore || 0;

// Ne sauvegarder que si c'est un MEILLEUR score
const newDailyScore = Math.max(currentDailyScore, score);
const newDailyGlobal = Math.max(currentDailyGlobal, globalPoints);

await firestore()
  .collection(this.COLLECTION)
  .doc(dailyDocId)
  .set({
    ...baseData,
    [modeScoreField]: newDailyScore, // ✅ MEILLEUR score du jour
    globalScore: newDailyGlobal,
    level: newDailyScore > currentDailyScore ? level : (dailyData?.level || level),
    ...
  }, { merge: true });
```

#### 2. **Classement Hebdomadaire (Weekly)**
```typescript
// ✅ NOUVEAU CODE (APRÈS)
const weeklyDocId = `weekly_${year}_${weekNumber}_${mode}_${userId}`;
const weeklyDoc = await firestore()
  .collection(this.COLLECTION)
  .doc(weeklyDocId)
  .get();

const weeklyData = weeklyDoc.exists() ? weeklyDoc.data() : null;
const currentWeeklyScore = weeklyData?.[modeScoreField] || 0;
const currentWeeklyGlobal = weeklyData?.globalScore || 0;

// Ne sauvegarder que si c'est un MEILLEUR score
const newWeeklyScore = Math.max(currentWeeklyScore, score);
const newWeeklyGlobal = Math.max(currentWeeklyGlobal, globalPoints);

await firestore()
  .collection(this.COLLECTION)
  .doc(weeklyDocId)
  .set({
    ...baseData,
    [modeScoreField]: newWeeklyScore, // ✅ MEILLEUR score de la semaine
    globalScore: newWeeklyGlobal,
    level: newWeeklyScore > currentWeeklyScore ? level : (weeklyData?.level || level),
    ...
  }, { merge: true });
```

---

## 🎯 Comportement Attendu

### Scénario Exemple

**Joueur "Alice" - Lundi 19 Nov 2025**

| Partie | Score | Niveau | Avant Fix | Après Fix |
|--------|-------|--------|-----------|-----------|
| 1 (10h00) | 1500 | 8 | Classement: 1500 | Classement: 1500 ✅ |
| 2 (11h00) | 800 | 5 | Classement: **800** ❌ | Classement: **1500** ✅ |
| 3 (12h00) | 2000 | 10 | Classement: 2000 | Classement: 2000 ✅ |
| 4 (13h00) | 1200 | 7 | Classement: **1200** ❌ | Classement: **2000** ✅ |

**Résultat**:
- ❌ **Avant**: Classement affichait 1200 (dernier score)
- ✅ **Après**: Classement affiche 2000 (meilleur score)

---

## 📊 Impact sur les Classements

### Classement "Tout Temps"
- ✅ Déjà correct (utilisait `Math.max()`)
- ✅ Aucun changement nécessaire

### Classement "Jour"
- ❌ Avant: Affichait dernier score de la journée
- ✅ Après: Affiche meilleur score de la journée
- 📈 Impact: Les joueurs voient leur vraie performance quotidienne

### Classement "Semaine"
- ❌ Avant: Affichait dernier score de la semaine
- ✅ Après: Affiche meilleur score de la semaine
- 📈 Impact: Classement hebdomadaire plus juste et motivant

---

## 🧪 Tests Recommandés

### Test 1: Classement Quotidien
```bash
1. Jouer partie 1 → Score 1000
2. Vérifier classement "Jour" → Doit afficher 1000
3. Jouer partie 2 → Score 500
4. Vérifier classement "Jour" → Doit toujours afficher 1000 ✅
5. Jouer partie 3 → Score 1500
6. Vérifier classement "Jour" → Doit afficher 1500 ✅
```

### Test 2: Classement Hebdomadaire
```bash
1. Lundi → Jouer partie 1 → Score 2000
2. Vérifier classement "Semaine" → Doit afficher 2000
3. Mardi → Jouer partie 2 → Score 1000
4. Vérifier classement "Semaine" → Doit afficher 2000 ✅
5. Mercredi → Jouer partie 3 → Score 2500
6. Vérifier classement "Semaine" → Doit afficher 2500 ✅
```

### Test 3: Niveau Associé
```bash
Vérifier que le niveau affiché correspond au niveau du MEILLEUR score:
- Score 2000 niveau 10 → Classement montre "Niveau 10"
- Score 1500 niveau 8 (joué après) → Classement montre toujours "Niveau 10" ✅
```

---

## 🔍 Logs de Debug

Pour vérifier le bon fonctionnement en production:

```typescript
// Ajouter logs dans saveScore() si nécessaire
console.log('[LEADERBOARD] Daily score comparison:', {
  userId,
  mode,
  currentScore: currentDailyScore,
  newScore: score,
  savedScore: newDailyScore,
  isNewBest: score > currentDailyScore
});
```

---

## 📱 Déploiement

### Étapes
1. ✅ Code modifié dans `src/services/leaderboard.ts`
2. ⏭️ Compiler: `cd android && ./gradlew assembleRelease`
3. ⏭️ Tester sur device physique
4. ⏭️ Vérifier classements "Jour" et "Semaine"
5. ⏭️ Déployer sur Play Store

### Note Importante
Les classements existants dans Firestore conservent leurs anciennes valeurs. Les nouveaux scores enregistrés utiliseront la logique corrigée.

Pour **réinitialiser** les classements existants (optionnel):
```bash
# Dans Firebase Console → Firestore
# Supprimer collections ou documents avec période 'daily' ou 'weekly'
# Les nouveaux scores seront enregistrés correctement
```

---

## 🎯 Bénéfices Utilisateurs

### Avant la Correction ❌
- Frustration: "J'ai fait 2000 points ce matin, pourquoi je suis à 1000 dans le classement?"
- Démotivation: Pas de reconnaissance du meilleur effort
- Classements inexacts: Mauvaise compétition

### Après la Correction ✅
- 😊 Satisfaction: Meilleure performance toujours visible
- 🏆 Motivation: Encouragement à battre son record
- ⚖️ Équité: Classement reflète vraiment les meilleures performances

---

## 📝 Checklist de Validation

- [x] Code modifié dans `leaderboard.ts`
- [x] Logique `Math.max()` appliquée pour daily
- [x] Logique `Math.max()` appliquée pour weekly
- [x] Niveau associé au meilleur score (pas dernier)
- [x] Pas d'erreurs TypeScript
- [ ] Test manuel classement "Jour"
- [ ] Test manuel classement "Semaine"
- [ ] Test avec plusieurs parties
- [ ] Vérification sur device physique
- [ ] Déploiement production

---

**Date**: 19 Novembre 2025  
**Version**: 2.1.0  
**Statut**: ✅ CORRIGÉ - Prêt pour déploiement  
**Impact**: 🏆 Classements quotidiens et hebdomadaires maintenant corrects
