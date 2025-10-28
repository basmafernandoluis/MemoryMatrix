# 🏆 Système de Classement Multi-Modes

## 📋 Vue d'Ensemble

Le système de classement **hybride** permet de comparer les joueurs de plusieurs façons :
- **Classement Global** : Points cumulés de tous les modes (polyvalence)
- **Classements par Mode** : Meilleurs scores dans chaque mode (spécialisation)
- **Filtres Temporels** : Jour / Semaine / All-Time

---

## 🎯 Architecture du Système

### Structure des Données (`LeaderboardEntry`)

```typescript
interface LeaderboardEntry {
  userId: string;
  displayName: string;
  
  // Score global (tous modes confondus)
  globalScore: number;
  
  // Meilleurs scores par mode
  classicBest: number;
  survivalBest: number;
  timeAttackBest: number;
  zenBest: number;
  
  // Métadonnées
  gamesPlayed: number;
  lastPlayed: Date;
  timestamp: Date;
  
  // Informations calculées
  rank?: number;
  level?: number;
}
```

---

## 💰 Système de Conversion de Points Globaux

### Formules par Mode

| Mode | Formule | Justification |
|------|---------|---------------|
| 🎮 **Classique** | `score × 1.0` | **Référence de base** - Aucun multiplicateur |
| 🔥 **Survie** | `streak × 50` | **Valorise la progression** - Un streak de 10 = 500 points |
| ⏱️ **Contre-la-Montre** | `(score × 1.2) + (niveau × 10)` | **Bonus pression temporelle** - Récompense vitesse ET performance |
| 🧘 **Zen** | `score × 0.8` | **Mode détendu** - Moins de points car pas de stress |
| ⚙️ **Custom** | `score × 0.9` | **Configuration personnalisée** - Légèrement réduit |

### Exemples de Conversion

```typescript
// Partie Classique: score 1000, niveau 5
globalPoints = 1000 × 1.0 = 1000 points

// Partie Survie: streak 15
globalPoints = 15 × 50 = 750 points

// Partie TimeAttack: score 800, niveau 7
globalPoints = (800 × 1.2) + (7 × 10) = 960 + 70 = 1030 points

// Partie Zen: score 1200
globalPoints = 1200 × 0.8 = 960 points
```

---

## 🎨 Interface Utilisateur

### Onglets de Période
```
📅 Jour  |  📆 Semaine  |  🏆 Total
```

### Onglets de Mode (ScrollView Horizontal)
```
🌟 Global  |  🎮 Classique  |  🔥 Survie  |  ⏱️ Chrono  |  🧘 Zen
```

### Affichage Dynamique
- **Global** : Affiche `globalScore`
- **Classique** : Affiche `classicBest`
- **Survie** : Affiche `survivalBest`
- **TimeAttack** : Affiche `timeAttackBest`
- **Zen** : Affiche `zenBest`

---

## 📊 Stratégie de Sauvegarde Firestore

### Collections et Documents

#### 1. All-Time (Global)
```
leaderboard/alltime_{userId}
{
  globalScore: 15430,
  classicBest: 1250,
  survivalBest: 18,
  timeAttackBest: 980,
  zenBest: 1400,
  gamesPlayed: 47,
  lastPlayed: Timestamp,
  level: 8
}
```

#### 2. Daily (par Mode)
```
leaderboard/daily_2025-10-27_classic_{userId}
{
  classicBest: 1250,
  globalScore: 1250,
  date: "2025-10-27",
  mode: "classic",
  level: 8
}
```

#### 3. Weekly (par Mode)
```
leaderboard/weekly_2025_43_survival_{userId}
{
  survivalBest: 18,
  globalScore: 900,
  week: 43,
  year: 2025,
  mode: "survival",
  level: 12
}
```

### Logique de Mise à Jour

```typescript
// 1. Calculer les points globaux
const globalPoints = calculateGlobalPoints(score, level, mode);

// 2. Récupérer entrée existante
const existingData = await getDoc('alltime_{userId}');

// 3. Cumuler globalScore (addition)
newGlobalScore = existingData.globalScore + globalPoints;

// 4. Mettre à jour meilleur score mode (maximum)
newModeBest = Math.max(existingData[modeKey], score);

// 5. Incrémenter compteur parties
gamesPlayed = existingData.gamesPlayed + 1;
```

---

## 🔍 Requêtes Firestore

### Classement Global All-Time
```typescript
firestore()
  .collection('leaderboard')
  .where('period', '==', 'alltime')
  .orderBy('globalScore', 'desc')
  .limit(100)
```

### Classement Survie Jour
```typescript
firestore()
  .collection('leaderboard')
  .where('date', '==', '2025-10-27')
  .where('period', '==', 'daily')
  .orderBy('survivalBest', 'desc')
  .limit(100)
```

### Rang Utilisateur TimeAttack Semaine
```typescript
// 1. Récupérer score utilisateur
const userScore = await getDoc('weekly_2025_43_timeAttack_{userId}');

// 2. Compter scores supérieurs
const betterScores = await firestore()
  .collection('leaderboard')
  .where('week', '==', 43)
  .where('year', '==', 2025)
  .where('period', '==', 'weekly')
  .where('timeAttackBest', '>', userScore.timeAttackBest)
  .get();

rank = betterScores.size + 1;
```

---

## 🧪 Tests et Validation

### Scénarios de Test

#### Test 1: Nouveau Joueur
```typescript
// Première partie en Classique: score 500, niveau 3
saveScore(userId, "Player1", 500, 3, 'classic')

// Résultat attendu:
{
  globalScore: 500,
  classicBest: 500,
  survivalBest: 0,
  timeAttackBest: 0,
  zenBest: 0,
  gamesPlayed: 1
}
```

#### Test 2: Accumulation Global + Max Mode
```typescript
// Partie 1: Classique score 800
saveScore(userId, "Player1", 800, 5, 'classic')
// globalScore: 800, classicBest: 800

// Partie 2: Classique score 600 (plus faible)
saveScore(userId, "Player1", 600, 4, 'classic')
// globalScore: 800 + 600 = 1400
// classicBest: max(800, 600) = 800 (inchangé)

// Partie 3: Survie streak 12
saveScore(userId, "Player1", 12, 12, 'survival')
// globalScore: 1400 + (12 × 50) = 2000
// survivalBest: 12
```

#### Test 3: Filtrage Multi-Mode
```typescript
// Player A joue tous les modes
Player A: {
  globalScore: 5000,
  classicBest: 1200,
  survivalBest: 20,
  timeAttackBest: 950,
  zenBest: 1100
}

// Player B spécialiste Survie
Player B: {
  globalScore: 2500,
  classicBest: 200,
  survivalBest: 50, // Meilleur
  timeAttackBest: 0,
  zenBest: 0
}

// Classement Global: A > B (5000 vs 2500)
// Classement Survie: B > A (50 vs 20) ✅
```

---

## ⚙️ Configuration Firestore

### Index Nécessaires

```javascript
// Index 1: All-Time Global
collection: leaderboard
fields: [period ASC, globalScore DESC]

// Index 2: Daily Classic
collection: leaderboard
fields: [date ASC, period ASC, classicBest DESC]

// Index 3: Weekly Survival
collection: leaderboard
fields: [week ASC, year ASC, period ASC, survivalBest DESC]

// Index 4: TimeAttack comparaison
collection: leaderboard
fields: [period ASC, timeAttackBest ASC]

// Index 5: Zen ranking
collection: leaderboard
fields: [period ASC, zenBest DESC]
```

### Règles de Sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{entryId} {
      // Lecture publique
      allow read: if true;
      
      // Écriture uniquement par le propriétaire authentifié
      allow create, update: if request.auth != null 
                            && request.resource.data.userId == request.auth.uid;
      
      // Interdire suppression
      allow delete: if false;
    }
  }
}
```

---

## 📈 Stratégies de Jeu et Méta

### Pour le Classement Global
**Stratégie optimale** : Jouer **TOUS les modes** pour accumuler des points
- Classique (1.0x) : Base solide
- TimeAttack (1.2x) : Meilleur ratio points/temps
- Survie (50 pts/streak) : Explosif si bon streak
- Zen (0.8x) : Pour s'entraîner sans trop de pression

### Pour les Classements Spécialisés
**Stratégie optimale** : Se concentrer sur **UN seul mode** pour maximiser le score
- **Classique** : Viser niveau 10 avec 0 erreur
- **Survie** : Progression lente, patience
- **TimeAttack** : Vitesse + précision
- **Zen** : Perfectionnisme (100% précision)

### Équilibrage
Les multiplicateurs sont conçus pour que :
- 1 partie Classique (1000 pts) ≈ 1 partie TimeAttack (833 pts base × 1.2)
- 1 streak Survie de 20 (1000 pts) ≈ 1 partie Classique (1000 pts)
- Mode Zen moins lucratif encourage l'entraînement sans "grind"

---

## 🐛 Problèmes Connus et Solutions

### Problème 1: Duplicatas d'Index Firestore
**Symptôme** : `FAILED_PRECONDITION: The query requires an index`

**Solution** :
1. Firestore Console → Indexes
2. Créer index composite pour chaque requête
3. Attendre génération (2-5 minutes)

### Problème 2: Synchronisation Temps Réel
**Symptôme** : Classement ne se met pas à jour immédiatement

**Solution** :
- Implémenter `onSnapshot()` pour écoute temps réel
- Ou utiliser `RefreshControl` avec pull-to-refresh

### Problème 3: Performances avec Gros Leaderboards
**Symptôme** : Lenteur avec 10k+ joueurs

**Solution** :
- Limiter à 100 entrées par requête
- Implémenter pagination avec `startAfter()`
- Cache local avec TTL 5 minutes

---

## 📝 Checklist de Déploiement

- [x] Types TypeScript mis à jour (`LeaderboardEntry`)
- [x] Fonction `calculateGlobalPoints()` implémentée
- [x] Service `leaderboard.ts` adapté avec paramètre `mode`
- [x] `LeaderboardScreen` avec onglets Global/Classic/Survival/TimeAttack/Zen
- [x] Intégration `saveScore()` avec mode dans `App.tsx`
- [ ] **Créer les index Firestore** (CRITIQUE)
- [ ] **Mettre à jour les règles de sécurité Firestore**
- [ ] Tester avec plusieurs comptes utilisateurs
- [ ] Vérifier accumulation globalScore
- [ ] Vérifier conservation des meilleurs scores par mode
- [ ] Tester filtres période (daily/weekly/alltime)
- [ ] Tester filtres mode (global/classic/survival/timeAttack/zen)
- [ ] Valider performances avec 1000+ entrées

---

## 🚀 Prochaines Améliorations

### Court Terme
- [ ] Afficher badges spéciaux pour top 3 par mode
- [ ] Animations de transition entre onglets
- [ ] Indicateur visuel du mode joué dans GameScreen

### Moyen Terme
- [ ] Système de saisons (reset mensuel)
- [ ] Classements par région géographique
- [ ] Graphiques de progression personnelle
- [ ] Notifications push pour changement de rang

### Long Terme
- [ ] Matchmaking basé sur le rang
- [ ] Système de ligues (Bronze/Argent/Or/Platine/Diamant)
- [ ] Récompenses exclusives par rang
- [ ] Tournois hebdomadaires avec prix

---

## 📚 Références

- **Firestore Queries** : https://firebase.google.com/docs/firestore/query-data/queries
- **Composite Indexes** : https://firebase.google.com/docs/firestore/query-data/indexing
- **React Native Performance** : https://reactnative.dev/docs/performance
- **TypeScript Best Practices** : https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html

---

*Dernière mise à jour: 27 octobre 2025 - Branche 1erDeploimenet*
