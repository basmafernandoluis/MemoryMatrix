# 🎮 Phase 10: Modes de Jeu Avancés - TERMINÉE ✅

## 📋 Vue d'ensemble

La Phase 10 ajoute **5 modes de jeu** différents à Memory Matrix, offrant une expérience variée et adaptée à tous les styles de joueurs.

---

## ✅ Modes Implémentés

### 1. 🎮 Mode Classique
**Description :** Le mode original de Memory Matrix

**Caractéristiques :**
- 10 niveaux de difficulté progressive
- 3 vies
- Grilles de 2x2 à 6x6
- Scoring standard
- Objectif : Terminer tous les niveaux

**Config technique :**
```typescript
{
  hasLives: true,
  hasTimer: false,
  difficultyProgression: 'normal',
  startingLevel: 1
}
```

---

### 2. 🔥 Mode Survie
**Description :** Vie infinie, difficulté croissante. Jusqu'où irez-vous ?

**Caractéristiques :**
- **Vie infinie** - Pas de game over sur erreur
- Difficulté augmente plus rapidement
- Scoring avec multiplicateur progressif
- Grilles jusqu'à 8x8
- Système de streak (niveaux consécutifs)

**Spécificités :**
- Grille augmente tous les 3 niveaux (au lieu de 1)
- Multiplicateur de score : 1 + (niveau / 5) × 0.5
- Tracking du meilleur streak
- Stats : currentStreak, bestStreak, difficultyMultiplier

**Config technique :**
```typescript
{
  hasLives: false,  // Pas de game over !
  difficultyProgression: 'fast',
  startingLevel: 1
}
```

---

### 3. ⏱️ Mode Contre-la-Montre
**Description :** 2 minutes pour scorer un maximum ! Chaque niveau donne +15s.

**Caractéristiques :**
- **Timer dégressif** - 120 secondes au départ
- +15s de bonus par niveau (+5s supplémentaires tous les 3 niveaux)
- 3 vies
- Multiplicateur de score : ×1.5
- Pression temporelle intense

**Bonus de temps :**
```typescript
Niveau 1-2:  +15s
Niveau 3-5:  +20s
Niveau 6-8:  +25s
Niveau 9+:   +30s
```

**Stats trackées :**
- Temps restant
- Bonus de temps gagnés
- Meilleur temps de complétion

**Config technique :**
```typescript
{
  hasLives: true,
  hasTimer: true,
  timerDuration: 120,  // 2 minutes
  difficultyProgression: 'normal'
}
```

---

### 4. 🧘 Mode Zen
**Description :** Sans pression. Prenez votre temps, relaxez-vous.

**Caractéristiques :**
- **Vie infinie** - Pas de stress
- **Pas de timer** - Temps illimité
- Progression douce
- Focus sur la précision
- Multiplicateur de score réduit (×0.8)

**Idéal pour :**
- Débutants
- Entraînement sans pression
- Relaxation
- Améliorer la précision

**Stats trackées :**
- Temps total joué
- Nombre de coups parfaits
- Précision moyenne

**Config technique :**
```typescript
{
  hasLives: false,
  hasTimer: false,
  difficultyProgression: 'slow',
  startingLevel: 1
}
```

---

### 5. ⚙️ Mode Personnalisé
**Description :** Créez votre propre défi !

**Caractéristiques :**
- Grille personnalisable
- Longueur de séquence ajustable
- Paramètres au choix
- Multiplicateur : ×1.2

**Déblocage :** Niveau 5 en mode Classique

**Config technique :**
```typescript
{
  hasLives: true,
  difficultyProgression: 'none',
  customGridSize: 3,
  customSequenceLength: 5
}
```

---

## 📁 Fichiers Créés

### Types et Interfaces
**`src/types/index.ts`**
```typescript
// Nouveaux types ajoutés
GameMode: 'classic' | 'survival' | 'timeAttack' | 'zen' | 'custom'
GameModeConfig
SurvivalStats
TimeAttackStats
ZenStats
```

### Configuration
**`src/constants/gameModes.ts`**
- Configuration de tous les modes
- Fonctions de calcul de multiplicateurs
- Système de déblocage
- Helpers pour chaque mode

### UI
**`src/screens/GameModeSelector.tsx`**
- Sélecteur de mode élégant
- Cartes colorées par mode
- Affichage des caractéristiques
- Système de verrouillage/déverrouillage
- Badges informatifs

### Logique
**`src/hooks/useGameLogicExtended.ts`**
- Hook complet multi-modes
- Gestion du timer (Time Attack)
- Stats par mode
- Logique de survie
- Système sans game over (Zen/Survival)

---

## 🎨 Design des Cartes

Chaque mode a sa **couleur distinctive** :

| Mode | Couleur | Icône |
|------|---------|-------|
| Classique | `#4A90E2` (Bleu) | 🎮 |
| Survie | `#FF6B6B` (Rouge) | 🔥 |
| Contre-la-Montre | `#FFB84D` (Orange) | ⏱️ |
| Zen | `#95E1D3` (Vert menthe) | 🧘 |
| Personnalisé | `#A29BFE` (Violet) | ⚙️ |

---

## 🎯 Scoring par Mode

### Classique
```
Points = (basePoints + levelBonus) × 1.0
```

### Survie
```
Points = (basePoints + levelBonus) × (1 + niveau/5 × 0.5)
Exemple niveau 10: ×2.0
Exemple niveau 20: ×3.0
```

### Contre-la-Montre
```
Points = (basePoints + levelBonus) × 1.5
```

### Zen
```
Points = (basePoints + levelBonus) × 0.8
```

### Personnalisé
```
Points = (basePoints + levelBonus) × 1.2
```

---

## 🔓 Système de Déblocage

| Mode | Condition de Déblocage |
|------|------------------------|
| Classique | Débloqué par défaut |
| Survie | Débloqué par défaut |
| Contre-la-Montre | Débloqué par défaut |
| Zen | Débloqué par défaut |
| Personnalisé | **Niveau 5 requis** en mode Classique |

---

## 🔧 Utilisation

### Dans HomeScreen
```typescript
const [showModeSelector, setShowModeSelector] = useState(false);

// Bouton pour ouvrir le sélecteur
<TouchableOpacity onPress={() => setShowModeSelector(true)}>
  <Text>Choisir un mode</Text>
</TouchableOpacity>

// Modal du sélecteur
{showModeSelector && (
  <GameModeSelector
    onSelectMode={(mode) => {
      setShowModeSelector(false);
      // Démarrer le jeu avec ce mode
      navigation.navigate('Game', { mode });
    }}
    onBack={() => setShowModeSelector(false)}
    maxLevelReached={userProgress?.maxLevelReached || 0}
  />
)}
```

### Dans GameScreen
```typescript
import { useGameLogicExtended } from '../hooks/useGameLogicExtended';

// Récupérer le mode depuis les params de navigation
const { mode = 'classic' } = route.params || {};

// Utiliser le hook étendu
const {
  gameState,
  gameModeState,  // Contient les stats spécifiques au mode
  gameStatus,
  startGame,
  handleCellClick,
  // ...
} = useGameLogicExtended(mode);

// Afficher le timer pour Time Attack
{gameModeState.mode === 'timeAttack' && (
  <Text>Temps: {gameModeState.timeAttackStats?.timeRemaining}s</Text>
)}

// Afficher le streak pour Survival
{gameModeState.mode === 'survival' && (
  <Text>Streak: {gameModeState.survivalStats?.currentStreak}</Text>
)}
```

---

## 📊 Stats Trackées par Mode

### Survie
```typescript
interface SurvivalStats {
  currentStreak: number;      // Niveaux consécutifs réussis
  bestStreak: number;         // Meilleur streak
  totalLevelsCompleted: number;
  difficultyMultiplier: number;
}
```

### Contre-la-Montre
```typescript
interface TimeAttackStats {
  timeRemaining: number;      // Temps restant (secondes)
  timeBonus: number;          // Dernier bonus gagné
  fastestCompletion: number;  // Record de temps
}
```

### Zen
```typescript
interface ZenStats {
  totalTimePlayed: number;    // Temps total (secondes)
  perfectMoves: number;       // Coups parfaits
  averageAccuracy: number;    // Précision moyenne (%)
}
```

---

## ✨ Fonctionnalités Clés

### 1. Timer Automatique (Time Attack)
Le timer se met à jour automatiquement toutes les secondes via `useEffect`:
```typescript
useEffect(() => {
  if (mode === 'timeAttack' && gameStatus === 'playing') {
    const interval = setInterval(() => {
      // Décrémenter le timer
      // Game over si temps écoulé
    }, 1000);
    return () => clearInterval(interval);
  }
}, [gameStatus, mode]);
```

### 2. Pas de Game Over (Zen/Survival)
En cas d'erreur, la séquence est simplement réaffichée :
```typescript
if (config.settings.hasLives === false) {
  // Pas de perte de vie
  setGameState(prev => ({
    ...prev,
    userSequence: [],
    isShowingSequence: true,
  }));
}
```

### 3. Progression Dynamique (Survival)
La taille de grille augmente plus vite :
```typescript
const getSurvivalDifficultyIncrease = (level: number): number => {
  const baseGridSize = 2;
  const increaseRate = Math.floor(level / 3);
  return Math.min(baseGridSize + increaseRate, 8); // Max 8x8
};
```

### 4. Bonus de Temps (Time Attack)
Plus on progresse, plus on gagne de temps :
```typescript
const getTimeBonusForLevel = (level: number): number => {
  return 15 + Math.floor(level / 3) * 5;
};
```

---

## 🎮 Expérience Utilisateur

### Écran de Sélection
- **Design élégant** avec dégradés de couleurs
- **Badges de verrouillage** pour modes non débloqués
- **Caractéristiques claires** de chaque mode
- **Bouton JOUER** visible sur chaque carte

### Feedback Visuel
- Couleur unique par mode
- Icônes expressives
- Animations fluides
- Messages adaptés au mode

### Accessibilité
- Tous les modes ont un texte descriptif clair
- Icônes universelles
- Feedback visuel et sonore
- Instructions dans chaque mode

---

## 🚀 Prochaines Améliorations Possibles

1. **Classements par mode** - Top scores pour chaque mode
2. **Achievements spécifiques** - Badges pour chaque mode
3. **Mode Duel** - Affronter un ami
4. **Mode Daily** - Défi quotidien avec seed fixe
5. **Replays** - Revoir ses meilleures performances
6. **Tutoriels** - Guide pour chaque mode

---

## 📈 Impact sur l'Engagement

Les modes de jeu diversifient l'expérience et augmentent la rétention :

- **Nouveauté** : 5 façons différentes de jouer
- **Adaptation** : Mode pour chaque type de joueur
- **Rejouabilité** : Raisons de revenir
- **Progression** : Système de déblocage motivant
- **Défis** : Objectifs variés

---

## ✅ Phase 10 - COMPLÈTE !

Tous les objectifs de la Phase 10 ont été atteints :

- [x] Mode Survie (vie infinie, difficulté croissante)
- [x] Mode Contre-la-Montre (timer + bonus de temps)
- [x] Mode Zen (sans limite de temps)
- [x] Mode Défi Personnalisé
- [x] Sélecteur de mode dans le menu

**Prochaine étape :** Intégrer le sélecteur dans HomeScreen et adapter GameScreen !

---

*Développé avec passion pour Memory Matrix 🧠✨*
