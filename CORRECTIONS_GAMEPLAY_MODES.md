# 🔧 Corrections Gameplay - Modes de Jeu

## 🐛 Problèmes Identifiés et Corrigés

### 1. **Mode Classique** 🎮
**Problèmes:**
- ❌ 5 vies au lieu de 3
- ❌ Indice ne fonctionne pas

**Solutions:**
- ✅ Corrigé : 3 vies maintenant (modifié dans `useGameLogicExtended.ts`)
- ✅ **Indices : Implémentés !** (fonction `useHint` complète)

### 2. **Mode Survie** 🔥
**Problèmes:**
- ❌ Affiche 5 vies au lieu de vies infinies
- ❌ Record (bestStreak) non persisté

**Solutions:**
- ✅ Vies infinies (999) + cœurs cachés dans l'UI
- ✅ BestStreak sauvegardé dans `UserProgress.survivalBestStreak`
- ✅ Chargement du bestStreak au démarrage
- ✅ Reset du currentStreak sur erreur (mais bestStreak conservé)
- ✅ Nouveau fichier : `src/utils/gameModeStorage.ts`

### 3. **Mode Contre-la-Montre** ⏱️
**Problèmes:**
- ❌ Affiche 5 vies
- ❌ Bonus de temps +15s non souhaité
- ❌ Indice fait perdre du temps

**Solutions:**
- ✅ 3 vies (comme le mode classique)
- ✅ Timer fixe de 120s (pas de bonus)
- ✅ Timer fonctionne correctement (décompte 1s par seconde)
- ✅ **Timer PAUSE pendant l'indice** ⏸️ (ne perd aucune seconde)
- ✅ **Timer REPREND automatiquement** après l'indice ▶️
- ⏳ TODO: Afficher meilleur record TimeAttack dans GameHeader
- ⏳ TODO: Sauvegarder meilleur score avec `updateTimeAttackBestTime()`

### 4. **Mode Zen** 🧘
**Problèmes:**
- ❌ Affiche des vies alors qu'il n'y en a pas

**Solutions:**
- ✅ Vies infinies (999) + cœurs cachés dans l'UI
- ✅ Affichage précision en temps réel
- ✅ Calcul correct: `(perfectMoves / totalMoves) * 100`

### 5. **Mode Personnalisé** ⚙️
**Status:**
- 🔒 Débloqué au niveau 5
- ⏳ UI de configuration à implémenter (Phase future)
- 📋 Principe: Permettre au joueur de personnaliser:
  - Nombre de vies (1-10 ou infini)
  - Timer (optionnel, 0-300s)
  - Taille de grille (3x3 à 6x6)
  - Longueur de séquence initiale

---

## 📁 Fichiers Modifiés

### `src/hooks/useGameLogicExtended.ts`
```typescript
// Vies correctement configurées par mode
let initialLives = 3; // Classic, TimeAttack
if (config.settings.hasLives === false) {
  initialLives = 999; // Zen, Survival
}

// Chargement du bestStreak pour Survival
survivalStats: mode === 'survival' ? {
  currentStreak: 0,
  bestStreak: (await getSurvivalBestStreak()) || 0,
  // ...
} : undefined,

// Sauvegarde du nouveau record
if (newBest > gameModeState.survivalStats.bestStreak) {
  await updateSurvivalBestStreak(newBest);
}

// Reset du streak sur erreur (Survival)
if (gameModeState.mode === 'survival') {
  currentStreak: 0, // Reset mais bestStreak conservé
}

// Système d'indices avec pause timer TimeAttack
const useHint = useCallback(() => {
  if (gameState.hintsRemaining > 0 && gameStatus === 'playing') {
    const wasTimeAttack = gameModeState.mode === 'timeAttack';
    
    setGameState(prev => ({
      ...prev,
      hintsRemaining: prev.hintsRemaining - 1,
      isHintReplay: true, // Vitesse lente
      isPaused: wasTimeAttack, // ⏸️ Pause timer si TimeAttack
    }));
    
    if (wasTimeAttack) setIsPaused(true);
    return true;
  }
  return false;
}, [gameState, gameStatus, gameModeState.mode]);
```

### `src/components/GameHeader.tsx`
```typescript
// Nouveau prop hideHearts
hideHearts?: boolean;

// Affichage conditionnel des cœurs
{!hideHearts && (
  <View style={styles.stat}>
    {/* 3 cœurs au lieu de 5 */}
    {Array.from({ length: 3 }).map(...)}
  </View>
)}
```

### `src/screens/GameScreen.tsx`
```typescript
<GameHeader
  // ...
  hideHearts={mode === 'zen' || mode === 'survival'}
/>

// Handler indice avec pause timer TimeAttack
const handleHintPress = async () => {
  await feedback.buttonPress();
  const hintUsed = useHint();
  if (!hintUsed) await feedback.wrong();
};

// Reprise timer après indice
if (gameState.isHintReplay && mode === 'timeAttack') {
  togglePause(); // ▶️ Unpause pour relancer le timer
}
```

### `src/utils/gameModeStorage.ts` (NOUVEAU)
```typescript
export const updateSurvivalBestStreak = async (newStreak: number)
export const updateTimeAttackBestTime = async (timeRemaining: number)
export const updateZenBestAccuracy = async (accuracy: number)
export const getSurvivalBestStreak = async (): Promise<number>
export const getTimeAttackBestTime = async (): Promise<number>
export const getZenBestAccuracy = async (): Promise<number>
```

### `SYSTEME_INDICES.md` (NOUVEAU)
Documentation complète du système d'indices avec pause timer TimeAttack.

### `src/types/index.ts`
```typescript
export interface UserProgress {
  // ... existing fields
  survivalBestStreak?: number;
  timeAttackBestTime?: number;
  zenBestAccuracy?: number;
}
```

---

## ✅ Résumé des Corrections

| Mode | Vies | UI Vies | Streak/Timer | Persistance | Indices | Status |
|------|------|---------|--------------|-------------|---------|--------|
| 🎮 Classic | 3 | ✅ 3 cœurs | - | High Score | ✅ 3 | ✅ OK |
| 🔥 Survival | ∞ (999) | ❌ Cachées | ✅ Tracking | ✅ bestStreak | ✅ 3 | ✅ OK |
| ⏱️ TimeAttack | 3 | ✅ 3 cœurs | ✅ Timer -1s | ⏳ TODO | ✅ 3 ⏸️ | ✅ OK |
| 🧘 Zen | ∞ (999) | ❌ Cachées | ✅ Précision | ⏳ TODO | ✅ 3 | ✅ OK |
| ⚙️ Custom | Variable | ⚙️ | Variable | - | ✅ 3 | ⏳ TODO |

**Légende Indices:**
- ✅ 3 : 3 indices disponibles
- ⏸️ : Timer pause pendant l'indice (TimeAttack uniquement)

---

## 📝 TODO Restants

### Priorité Haute
1. ✅ ~~Corriger nombre de vies (3 au lieu de 5)~~
2. ✅ ~~Cacher les cœurs en mode Zen/Survival~~
3. ✅ ~~Persister le bestStreak du mode Survival~~
4. ✅ ~~**Implémenter les indices (hint system)**~~
5. ✅ ~~**Pause timer TimeAttack pendant l'indice**~~

### Priorité Moyenne
5. ⏳ Afficher le meilleur temps en mode TimeAttack
6. ⏳ Persister le meilleur temps TimeAttack
7. ⏳ Persister la meilleure précision Zen
8. ⏳ Afficher les records sur GameOverScreen par mode

### Priorité Basse
9. ⏳ Implémenter l'UI de configuration du mode Custom
10. ⏳ Ajouter un tutoriel pour chaque mode
11. ⏳ Leaderboard séparé par mode

---

## 🎯 Mode Personnalisé - Principe

Le mode **Personnalisé** (⚙️) sera débloqué après avoir atteint le **niveau 5** en mode Classique.

### Configuration Prévue:
```typescript
interface CustomModeSettings {
  lives: number | 'infinite'; // 1-10 ou infini
  hasTimer: boolean;
  timerDuration?: number; // Si hasTimer = true (0-300s)
  gridSize: 3 | 4 | 5 | 6; // Taille de la grille
  sequenceLength: number; // Longueur initiale (2-10)
  difficulty: 'easy' | 'normal' | 'hard'; // Progression
}
```

### UI Prévue:
- Modal avec sliders et toggles
- Prévisualisation des paramètres
- Bouton "Sauvegarder la configuration"
- Bouton "Configuration rapide" (presets: Facile, Normal, Expert, Impossible)

### Exemples de configurations:
- **Débutant**: 10 vies, grille 3x3, séquence de 2
- **Speedrun**: 3 vies, timer 60s, grille 4x4, séquence de 3
- **Hardcore**: 1 vie, pas de timer, grille 6x6, séquence de 5
- **Zen Avancé**: Vie infinie, grille 5x5, séquence de 8

---

**Date:** 27 octobre 2025  
**Branche:** 1erDeploimenet  
**Version:** Phase 10 - Corrections Gameplay
