# 🌍 Système de Records Mondiaux par Mode - v1.3.0

## 📅 Date
**31 octobre 2025**

---

## 🎯 Objectif

Afficher les records mondiaux en temps réel pendant le jeu, permettant aux joueurs de comparer leur performance actuelle avec :
- Leur meilleur record personnel
- Le record mondial du mode en cours

---

## ✨ Fonctionnalités Implémentées

### 1. Service World Records

**Fichier** : `src/services/worldRecords.ts`

#### Fonctions Principales

```typescript
// Récupérer le record mondial pour un mode
getWorldRecordForMode(mode: GameMode): Promise<WorldRecord | null>

// Récupérer tous les records mondiaux
getAllWorldRecords(): Promise<WorldRecordsCache>

// S'abonner aux mises à jour en temps réel
subscribeToWorldRecord(mode, callback): () => void

// Obtenir le record personnel
getPersonalBestForMode(mode, userProgress): number

// Formater le record selon le mode
formatRecord(mode, value): string

// Label du record
getRecordLabel(mode): string
```

#### Système de Cache

- Cache local de 5 minutes pour éviter trop de requêtes Firestore
- Mise à jour automatique via subscriptions en temps réel
- Fonction `clearRecordsCache()` pour forcer le rafraîchissement

### 2. Hook useWorldRecords

**Fichier** : `src/hooks/useWorldRecords.ts`

#### Interface

```typescript
const {
  personalBest,           // Meilleur record personnel
  worldRecord,            // Record mondial
  isWorldRecordHolder,    // Le joueur détient-il le record ?
  isNearWorldRecord,      // À moins de 10% du record ?
  percentageOfWorld,      // % du record mondial atteint
} = useWorldRecords(mode, userProgress, currentValue, userId);
```

#### Calculs Automatiques

- Détection si le joueur détient le record mondial
- Calcul de proximité (90%+ = badge "Proche!")
- Mise à jour en temps réel via subscription Firestore

### 3. Affichage dans GameHeader

**Modifications** : `src/components/GameHeader.tsx`

#### Nouvelles Props

```typescript
mode?: GameMode;              // Mode de jeu actuel
currentModeValue?: number;    // Valeur actuelle (streak, score, etc.)
userId?: string;              // ID du joueur
```

#### Affichage

```
┌─────────────────┐
│ Score           │
│    1234         │
│                 │
│ 🏅 Toi: 1500pts │
│ 🌍 Monde: 2000pts│
└─────────────────┘
```

#### États Visuels

| État | Icône | Couleur | Badge |
|------|-------|---------|-------|
| Normal | 🌍 | Bleu (#2196F3) | - |
| Proche (90%+) | 🌍 | Orange (#FF5722) | 🔥 Proche! |
| Champion | 👑 | Or (#FFC107) | 👑 Champion! |

### 4. Intégration dans GameScreen

**Modifications** : `src/screens/GameScreen.tsx`

#### Fonction getCurrentModeValue()

```typescript
const getCurrentModeValue = (): number => {
  switch (mode) {
    case 'survival':
      return gameModeState.survivalStats?.currentStreak || 0;
    case 'timeAttack':
      return gameState.score;
    case 'zen':
      return gameModeState.zenStats?.averageAccuracy || 0;
    default:
      return gameState.score;
  }
};
```

#### Props GameHeader

```tsx
<GameHeader
  {...existingProps}
  mode={mode}
  currentModeValue={getCurrentModeValue()}
  userId={userId || undefined}
/>
```

---

## 📊 Formatage par Mode

### Classic & Time Attack & Custom
- **Affichage** : `1234 pts`
- **Champ Firestore** : `classicBest`, `timeAttackBest`, `globalScore`

### Survival
- **Affichage** : `15 niveaux`
- **Champ Firestore** : `survivalBest`

### Zen
- **Affichage** : `98.5%`
- **Champ Firestore** : `zenBest`

---

## 🎨 Design

### Styles

```typescript
recordsContainer: {
  marginTop: 4,
  gap: 2,
}

personalRecord: {
  fontSize: 9,
  color: COLORS.success,  // Vert
  fontWeight: FONT_WEIGHT.semibold,
  textAlign: 'center',
}

worldRecord: {
  fontSize: 9,
  color: '#2196F3',       // Bleu
  fontWeight: FONT_WEIGHT.semibold,
  textAlign: 'center',
}

// Si détenteur du record
worldRecordHolder: {
  color: COLORS.warning,   // Or
  textShadowColor: 'rgba(255, 193, 7, 0.5)',
  textShadowRadius: 4,
}

// Si proche du record (90%+)
nearWorldRecord: {
  color: '#FF5722',        // Orange
}
```

### Badges

```typescript
// Badge "🔥 Proche!"
nearRecordBadge: {
  fontSize: 8,
  color: '#FF5722',
  backgroundColor: 'rgba(255, 87, 34, 0.15)',
  paddingHorizontal: 4,
  borderRadius: 4,
}

// Badge "👑 Champion!"
recordHolderBadge: {
  fontSize: 8,
  color: COLORS.warning,
  backgroundColor: 'rgba(255, 193, 7, 0.15)',
  paddingHorizontal: 4,
  borderRadius: 4,
}
```

---

## 🔄 Flow Utilisateur

### Scénario 1 : Joueur Normal

```
1. Joueur lance partie en mode Survie
2. GameHeader charge les records:
   - Son meilleur: 10 niveaux
   - Record mondial: 25 niveaux
3. Affichage :
   🏅 Toi: 10 niveaux
   🌍 Monde: 25 niveaux (40% du record)
4. Joue et atteint 23 niveaux
5. Badge "🔥 Proche!" s'affiche (92% du record)
```

### Scénario 2 : Détenteur du Record

```
1. Joueur détient le record mondial
2. Affichage :
   🏅 Toi: 30 niveaux
   👑 Monde: 30 niveaux
   👑 Champion!
3. Couleur or avec effet glow
4. Si quelqu'un bat le record:
   - Subscription Firestore détecte le changement
   - worldRecord se met à jour automatiquement
   - Affichage change à 🌍 Monde: 31 niveaux
```

### Scénario 3 : Nouveau Record en Direct

```
1. Joueur joue en Time Attack
2. Son meilleur: 1500 pts
3. Record mondial: 2000 pts
4. Score actuel dépasse 1800 pts
5. Badge "🔥 Proche!" apparaît
6. Continue à jouer...
7. Atteint 2100 pts dans la partie
8. À la fin, son record est sauvegardé
9. Devient champion! 👑
```

---

## 🧪 Tests Effectués

### ✅ Compilation
- Pas d'erreurs TypeScript
- Tous les imports résolus
- Types cohérents

### 🔲 Tests Manuels Recommandés

#### Test 1 : Affichage Basique
- [ ] Lancer partie en mode Classic
- [ ] Vérifier affichage du record personnel
- [ ] Vérifier affichage du record mondial
- [ ] Vérifier formatage correct (pts, niveaux, %)

#### Test 2 : Modes Différents
- [ ] Tester en Survie → "15 niveaux"
- [ ] Tester en Time Attack → "1234 pts"
- [ ] Tester en Zen → "98.5%"

#### Test 3 : États Spéciaux
- [ ] Approcher 90% du record → Badge "🔥 Proche!"
- [ ] Si détenteur du record → Badge "👑 Champion!"
- [ ] Vérifier couleur or avec glow

#### Test 4 : Temps Réel
- [ ] Ouvrir 2 devices
- [ ] Battre un record sur device 1
- [ ] Vérifier mise à jour automatique sur device 2
- [ ] Délai < 2 secondes

#### Test 5 : Cache
- [ ] Ouvrir le jeu → 1ère requête Firestore
- [ ] Rejouer dans les 5 min → Utilise le cache
- [ ] Attendre 6 min → Nouvelle requête

---

## 📈 Performances

### Optimisations

1. **Cache Local** : 5 minutes
   - Évite requêtes Firestore répétées
   - Réduit coûts et latence

2. **Subscription Unique**
   - 1 listener par mode actif
   - Unsubscribe automatique au démontage

3. **Queries Optimisées**
   ```typescript
   firestore()
     .collection('leaderboard')
     .orderBy('survivalBest', 'desc')
     .limit(1)  // Seulement le top 1
   ```

### Impact Firestore

- **Lectures** : ~1 par mode par 5 min
- **Listeners** : 1 actif pendant le jeu
- **Écritures** : 0 (lecture seule)

---

## 🚀 Améliorations Futures

### Court Terme
1. **Animation d'apparition** du badge "Proche!"
2. **Son spécial** quand on approche du record
3. **Vibration** si on bat le record en direct

### Moyen Terme
1. **Top 3 mondiaux** au lieu de juste #1
2. **Classement par pays**
3. **Records quotidiens/hebdomadaires**

### Long Terme
1. **Historique des records**
   - "Le record était de X le 01/10"
   - Graphique d'évolution
2. **Notifications**
   - "Quelqu'un a battu votre record!"
   - "Vous êtes #2 mondial!"
3. **Replays**
   - Voir la partie du détenteur du record
   - Apprendre de ses stratégies

---

## 🔧 Configuration Firestore

### Index Requis

Pour que les queries fonctionnent, créer ces index composites :

```
Collection: leaderboard
Champs: classicBest (desc)
Champs: survivalBest (desc)
Champs: timeAttackBest (desc)
Champs: zenBest (desc)
Champs: globalScore (desc)
```

### Règles de Sécurité

```javascript
match /leaderboard/{entry} {
  // Lecture publique pour tous
  allow read: if true;
  
  // Écriture seulement par le propriétaire
  allow write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}
```

---

## 📝 Documentation Utilisateur

### Légende des Icônes

| Icône | Signification |
|-------|---------------|
| 🏅 | Votre meilleur record personnel |
| 🌍 | Record mondial actuel |
| 👑 | Vous êtes le champion mondial ! |
| 🔥 | Vous êtes proche du record ! |

### FAQ

**Q: Pourquoi je ne vois pas le record mondial ?**  
R: Vérifiez votre connexion Internet. Les records sont chargés depuis le cloud.

**Q: Le record mondial n'est pas à jour**  
R: Le cache est de 5 minutes. Attendez ou redémarrez l'app.

**Q: J'ai battu le record mais je ne vois pas la couronne**  
R: Le record doit être sauvegardé d'abord (fin de partie).

**Q: À combien dois-je être pour voir "🔥 Proche!" ?**  
R: À au moins 90% du record mondial.

---

## 📊 Métriques Attendues

### Engagement
- ⬆️ **Temps de jeu** : Compétition avec records mondiaux
- ⬆️ **Rejoue** : "Je peux battre ce record!"
- ⬆️ **Completion rate** : Motivation pour finir les parties

### Rétention
- ⬆️ **Retention J1** : Revenir pour battre le record
- ⬆️ **Sessions/jour** : Plusieurs tentatives

### Social
- ⬆️ **Screenshots** : Partager quand on est champion
- ⬆️ **Recommandations** : "Regarde mon record!"

---

## ✅ Checklist de Déploiement

### Code
- [x] Service worldRecords créé
- [x] Hook useWorldRecords implémenté
- [x] GameHeader mis à jour
- [x] GameScreen intégré
- [x] Pas d'erreurs TypeScript
- [x] Formatage selon mode

### Tests
- [ ] Tester tous les modes
- [ ] Vérifier badges (Champion, Proche)
- [ ] Tester temps réel avec 2 devices
- [ ] Valider cache (5 min)

### Firestore
- [ ] Créer les index composites
- [ ] Vérifier règles de sécurité
- [ ] Tester queries avec vraies données

### Documentation
- [x] Documentation technique
- [x] Guide utilisateur (FAQ)
- [ ] Vidéo de démonstration

---

**Prêt pour déploiement en v1.3.0 !** 🌍👑

