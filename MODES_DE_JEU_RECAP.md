# 🎮 Modes de Jeu - Memory Matrix

## Vue d'ensemble des 5 modes implémentés

---

## 1️⃣ Mode Classique 🎮

### Caractéristiques
- **Icône:** 🎮 Bleu (#4A90E2)
- **Disponibilité:** ✅ Débloqué dès le début
- **Difficulté:** Progression normale

### Règles
- **Vies:** 3 vies
- **Niveaux:** 10 niveaux maximum
- **Timer:** Aucun
- **Game Over:** Quand les 3 vies sont perdues

### Scoring
- Points de base par cellule correcte
- Bonus par niveau
- **Multiplicateur:** x1.0 (standard)

### Expérience Utilisateur
Le mode original de Memory Matrix. Parfait pour découvrir le jeu et s'entraîner. La difficulté augmente progressivement avec chaque niveau.

---

## 2️⃣ Mode Survie 🔥

### Caractéristiques
- **Icône:** 🔥 Rouge (#FF6B6B)
- **Disponibilité:** ✅ Débloqué dès le début
- **Difficulté:** Progression rapide

### Règles
- **Vies:** ∞ Illimitées (pas de game over)
- **Niveaux:** Illimités (continue indéfiniment)
- **Timer:** Aucun
- **Game Over:** Jamais ! En cas d'erreur, la séquence recommence

### Scoring
- **Multiplicateur:** x1.5 
- Augmente avec la difficulté (+0.2 tous les 5 niveaux)
- Bonus basé sur le streak actuel

### Stats Affichées
```
🔥 Série: [currentStreak] (Record: [bestStreak])
```
- **currentStreak:** Nombre de niveaux réussis d'affilée
- **bestStreak:** Meilleure série de la partie
- **totalLevelsCompleted:** Niveaux totaux terminés

### Difficulté Progressive
La taille de la grille augmente **plus rapidement** qu'en mode classique :
```typescript
gridSize = 2 + Math.floor(level / 3) // Au lieu de level + 1
```

### Expérience Utilisateur
Idéal pour les joueurs qui veulent repousser leurs limites sans la pression du game over. Chaque erreur fait recommencer le niveau actuel, mais le streak continue !

---

## 3️⃣ Mode Contre-la-Montre ⏱️

### Caractéristiques
- **Icône:** ⏱️ Orange (#FFB84D)
- **Disponibilité:** ✅ Débloqué dès le début
- **Difficulté:** Progression normale + pression du temps

### Règles
- **Vies:** 3 vies
- **Timer:** 120 secondes (2 minutes) **FIXES**
- **Bonus de temps:** ❌ **AUCUN** (pas de +15s)
- **Game Over:** Quand le temps atteint 0 OU les 3 vies perdues

### Scoring
- **Multiplicateur:** x2.0 (double points !)
- Encourage les performances rapides et précises
- Challenge: combien de niveaux en 120s ?

### Stats Affichées
```
⏱️ Temps: [timeRemaining]s
```
- **timeRemaining:** Secondes restantes (décompte en temps réel)
- **fastestCompletion:** Meilleur temps (pour futures stats)

### Timer Fixe
```typescript
// Décompte chaque seconde sans bonus
timerRef.current = setInterval(() => {
  timeRemaining -= 1;
  if (timeRemaining <= 0) {
    // GAME OVER !
  }
}, 1000);
// Pas de bonus de temps par niveau
```

### Expérience Utilisateur
Le mode ultime pour les speedrunners ! **120 secondes chrono sans bonus** - combien de niveaux pouvez-vous terminer avant que le temps ne soit écoulé ? Chaque seconde compte !

---

## 4️⃣ Mode Zen 🧘

### Caractéristiques
- **Icône:** 🧘 Turquoise (#95E1D3)
- **Disponibilité:** ✅ Débloqué dès le début
- **Difficulté:** Progression lente et douce

### Règles
- **Vies:** ∞ Illimitées (pas de game over)
- **Timer:** Aucun (temps illimité)
- **Niveaux:** Progression très lente
- **Game Over:** Jamais ! Mode relaxant sans pression

### Scoring
- **Multiplicateur:** x0.8 (légèrement réduit)
- Focus sur la précision plutôt que le score

### Stats Affichées
```
✨ Précision: [averageAccuracy]%
```
- **perfectMoves:** Nombre de coups parfaits
- **totalMoves:** Nombre total de coups joués
- **averageAccuracy:** Calculé en temps réel : `(perfectMoves / totalMoves) * 100`

### Calcul de Précision
```typescript
// Coup correct
if (isCorrect) {
  perfectMoves++;
  totalMoves++;
  averageAccuracy = (perfectMoves / totalMoves) * 100;
}

// Coup incorrect
else {
  totalMoves++;
  averageAccuracy = (perfectMoves / totalMoves) * 100;
}
```

### Expérience Utilisateur
Parfait pour se détendre, méditer, ou s'entraîner sans stress. Pas de limite de temps, pas de perte de vie, juste vous et votre mémoire. Idéal pour la concentration et l'amélioration de la précision.

---

## 5️⃣ Mode Personnalisé ⚙️

### Caractéristiques
- **Icône:** ⚙️ Violet (#A29BFE)
- **Disponibilité:** 🔒 **Débloqué après niveau 5 en mode Classique**
- **Difficulté:** Configurable

### Règles (Personnalisables)
- **Vies:** Ajustable (1-10 ou illimitées)
- **Timer:** Optionnel (0-300 secondes)
- **Taille de grille:** Personnalisable (3x3 à 6x6)
- **Longueur de séquence:** Ajustable

### Configuration Future
```typescript
settings: {
  hasLives: true/false,
  initialLives: number,
  hasTimer: true/false,
  timerDuration: number,
  customGridSize: number,
  customSequenceLength: number,
}
```

### Expérience Utilisateur
Créez votre propre défi ! Récompense pour les joueurs expérimentés qui ont atteint le niveau 5. Permet de personnaliser tous les paramètres pour créer l'expérience parfaite.

---

## 📊 Tableau Comparatif

| Mode | Vies | Timer | Game Over | Multiplicateur | Débloqué |
|------|------|-------|-----------|----------------|----------|
| 🎮 Classique | 3 | ❌ | Oui | x1.0 | ✅ Toujours |
| 🔥 Survie | ∞ | ❌ | Non | x1.5 | ✅ Toujours |
| ⏱️ Contre-la-Montre | 3 | ✅ 120s fixes | Oui | x2.0 | ✅ Toujours |
| 🧘 Zen | ∞ | ❌ | Non | x0.8 | ✅ Toujours |
| ⚙️ Personnalisé | ⚙️ | ⚙️ | ⚙️ | x1.0 | 🔒 Niveau 5 |

---

## 🔧 Implémentation Technique

### Fichiers Principaux

1. **src/types/index.ts**
   - `GameMode`: Type union des 5 modes
   - `GameModeConfig`: Interface de configuration
   - `SurvivalStats`, `TimeAttackStats`, `ZenStats`: Interfaces de stats

2. **src/constants/gameModes.ts**
   - `GAME_MODES`: Configuration complète des 5 modes
   - Helpers: `getScoreMultiplier()`, `getTimeBonusForLevel()`, etc.

3. **src/hooks/useGameLogicExtended.ts**
   - Logique de jeu multi-mode (350+ lignes)
   - Timer pour TimeAttack
   - Tracking stats pour chaque mode
   - Gestion des vies et game over par mode

4. **src/screens/GameModeSelector.tsx**
   - UI de sélection des modes
   - Cartes colorées avec badges de verrouillage
   - Animation et feedback

5. **src/screens/GameScreen.tsx**
   - Affichage des stats spécifiques par mode
   - UI adaptée selon le mode actif

---

## 🎯 Flux Utilisateur

```
HomeScreen
    ↓
[Bouton "Jouer"]
    ↓
GameModeSelector Modal
    ↓
Sélection d'un mode
    ↓
GameScreen (avec mode spécifique)
    ↓
Affichage stats temps réel
    ↓
Game Over / Victoire
    ↓
GameOverScreen
```

---

## ✅ État d'Implémentation

### Complété (100%)
- ✅ Configuration des 5 modes
- ✅ UI de sélection (GameModeSelector)
- ✅ Hook useGameLogicExtended avec logique complète
- ✅ Timer fonctionnel (TimeAttack)
- ✅ Streak tracking (Survival)
- ✅ Précision en temps réel (Zen)
- ✅ Vie infinie (Survival, Zen)
- ✅ Scoring différencié par mode
- ✅ Affichage stats en temps réel dans GameScreen
- ✅ Intégration HomeScreen → GameScreen
- ✅ Aucune erreur de compilation

### À Tester
- ⏳ Test end-to-end de chaque mode
- ⏳ Vérification des multiplicateurs de score
- ⏳ Validation du timer TimeAttack
- ⏳ Validation de la précision Zen
- ⏳ Validation du streak Survival

### Futures Améliorations
- 📋 Déblocage du mode Custom (UI de configuration)
- 📋 Sauvegarde des meilleures stats par mode
- 📋 Leaderboard séparé par mode
- 📋 Achievements spécifiques par mode

---

**Créé le:** 27 octobre 2025  
**Branche:** 1erDeploimenet  
**Phase:** 10/15 (60% du projet)
