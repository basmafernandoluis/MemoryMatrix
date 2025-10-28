# 💡 Système d'Indices - Documentation

## Vue d'ensemble

Le système d'indices permet aux joueurs de rejouer la séquence actuelle à vitesse réduite pour les aider à mémoriser. Chaque joueur dispose de **3 indices** par partie.

---

## 🎯 Fonctionnalités

### Comportement Général
- **Nombre d'indices :** 3 par partie (tous modes confondus)
- **Vitesse de replay :** 1.5x plus lente que la séquence normale
- **Effet :** Rejoue la séquence actuelle + reset la séquence utilisateur
- **Disponibilité :** Uniquement pendant la phase de jeu (`gameStatus === 'playing'`)

### Adaptation par Mode

| Mode | Comportement Indice | Timer | Notes |
|------|---------------------|-------|-------|
| 🎮 **Classic** | Standard | N/A | Replay normal |
| 🔥 **Survival** | Standard | N/A | Replay normal |
| ⏱️ **TimeAttack** | **Timer pausé** ✅ | ⏸️ Pause pendant replay | **Reprend après l'indice** |
| 🧘 **Zen** | Standard | N/A | Replay normal |
| ⚙️ **Custom** | Standard | Variable | Selon config |

---

## 🔧 Implémentation Technique

### 1. Hook `useGameLogicExtended.ts`

```typescript
const useHint = useCallback(() => {
  if (gameState.hintsRemaining > 0 && gameStatus === 'playing') {
    // En mode TimeAttack, on met en pause le timer pendant l'indice
    const wasTimeAttack = gameModeState.mode === 'timeAttack';
    
    // Décrémente le compteur d'indices
    setGameState(prev => ({
      ...prev,
      hintsRemaining: prev.hintsRemaining - 1,
      userSequence: [], // Reset pour réessayer
      isShowingSequence: true, // Rejoue la séquence
      isHintReplay: true, // Flag pour vitesse lente
      isPaused: wasTimeAttack, // Pause si TimeAttack
    }));
    
    if (wasTimeAttack) {
      setIsPaused(true); // Pause explicite pour arrêter le timer
    }
    
    setGameStatus('showing');
    feedback.cellClick();
    
    return true; // Succès
  }
  return false; // Échec
}, [gameState, gameStatus, gameModeState.mode]);
```

### 2. Screen `GameScreen.tsx`

#### Gestion du Timer en TimeAttack
```typescript
// À la fin du replay d'indice
if (gameState.isHintReplay && mode === 'timeAttack') {
  togglePause(); // Unpause pour relancer le timer
}
```

#### Handler du bouton indice
```typescript
const handleHintPress = async () => {
  await feedback.buttonPress();
  const hintUsed = useHint();
  if (!hintUsed) {
    await feedback.wrong(); // Feedback si impossible
  }
};
```

### 3. Animation Ralentie

```typescript
// Vitesse de replay 1.5x plus lente
const highlightDuration = gameState.isHintReplay 
  ? GAME_CONFIG.CELL_HIGHLIGHT_DURATION * 1.5 
  : GAME_CONFIG.CELL_HIGHLIGHT_DURATION;

const delayBetweenCells = gameState.isHintReplay 
  ? GAME_CONFIG.DELAY_BETWEEN_CELLS * 1.5 
  : GAME_CONFIG.DELAY_BETWEEN_CELLS;
```

---

## ⏱️ Comportement en Mode Contre-la-Montre

### Problématique
En mode TimeAttack, le timer décompte en continu. Sans adaptation, utiliser un indice ferait perdre des secondes précieuses pendant le replay.

### Solution Implémentée

#### 1. **Pause du Timer**
```typescript
if (wasTimeAttack) {
  setIsPaused(true); // ⏸️ Le timer s'arrête
}
```

#### 2. **Reprise du Timer**
```typescript
// À la fin du replay
if (gameState.isHintReplay && mode === 'timeAttack') {
  togglePause(); // ▶️ Le timer reprend
}
```

#### 3. **Déroulement Complet**
1. Joueur clique sur 💡 (3 indices restants)
2. ⏸️ **Timer PAUSE** immédiatement
3. 🎬 Séquence rejoue à vitesse réduite (1.5x plus lente)
4. ✅ Fin du replay
5. ▶️ **Timer REPREND** automatiquement
6. 🎮 Joueur peut réessayer (2 indices restants)

### Exemple Chronologique

```
Timer: 87s → Clic indice
Timer: 87s (PAUSE) → Replay 4 secondes
Timer: 87s (PAUSE) → Fin replay
Timer: 87s (REPRISE) → Continue décompte
Timer: 86s, 85s, 84s...
```

**Aucune seconde perdue !** ✅

---

## 🎨 Interface Utilisateur

### Bouton Indice (GameHeader)
```tsx
<Pressable
  onPress={handleHintPress}
  disabled={isHintDisabled || hintsRemaining === 0}
>
  <Text>💡</Text>
  {hintsRemaining > 0 && (
    <View style={styles.hintBadge}>
      <Text>{hintsRemaining}</Text>
    </View>
  )}
</Pressable>
```

### États du Bouton
- **Actif :** `hintsRemaining > 0` + `gameStatus === 'playing'`
- **Désactivé :** 
  - Pendant affichage séquence (`isShowingSequence`)
  - Game over (`isGameOver`)
  - Plus d'indices (`hintsRemaining === 0`)

### Feedback Visuel
- ✅ **Badge** : Affiche le nombre d'indices restants (3 → 2 → 1 → 0)
- 🔇 **Grisé** : Quand désactivé
- 🎵 **Son** : `feedback.cellClick()` quand utilisé

---

## 📊 Données Persistées

### GameState
```typescript
interface GameState {
  // ...
  hintsRemaining: number; // 3 au départ, décrémenté
  isHintReplay: boolean; // Flag pour vitesse lente
}
```

### Stockage
- ❌ **Non persisté** entre sessions
- ✅ **Réinitialisé** à 3 à chaque nouvelle partie
- ✅ **Partagé** entre tous les modes (même compteur)

---

## 🧪 Tests Recommandés

### Test 1: Mode Classique
1. Lancer partie mode Classic
2. Attendre séquence niveau 1
3. Cliquer indice 💡
4. Vérifier: séquence rejoue lentement
5. Vérifier: badge affiche "2"
6. Vérifier: séquence utilisateur reset

### Test 2: Mode TimeAttack - Timer Pause
1. Lancer partie mode TimeAttack
2. Noter temps actuel (ex: 103s)
3. Cliquer indice 💡
4. **Vérifier: timer ARRÊTÉ pendant replay**
5. Attendre fin replay (4-5 secondes)
6. **Vérifier: timer REPREND au même temps (103s)**
7. Vérifier: timer continue normalement (102s, 101s...)

### Test 3: Épuisement des Indices
1. Utiliser 3 indices
2. Vérifier: badge affiche "0"
3. Vérifier: bouton désactivé (grisé)
4. Cliquer bouton désactivé
5. Vérifier: son `feedback.wrong()` joué

### Test 4: Autres Modes
- ✅ Survival: indice fonctionne, pas d'effet secondaire
- ✅ Zen: indice fonctionne, pas d'effet secondaire
- ✅ Custom: indice fonctionne selon config

---

## 🐛 Problèmes Résolus

### ❌ Avant
```typescript
const handleHintPress = async () => {
  await feedback.buttonPress();
  // TODO: Implémenter useHint dans useGameLogicExtended
};
```
- Bouton indice ne faisait rien
- Pas de fonction `useHint` dans le hook
- Pas de gestion du timer TimeAttack

### ✅ Après
```typescript
const useHint = useCallback(() => {
  // Implémentation complète
  // Pause timer en TimeAttack
  // Replay lent
  return true/false;
}, [...]);
```
- ✅ Indice fonctionne dans tous les modes
- ✅ Timer TimeAttack pausé pendant replay
- ✅ Timer reprend automatiquement après
- ✅ Feedback visuel et sonore complet

---

## 📝 Notes de Développement

### Choix de Design
1. **3 indices** : Équilibre entre aide et challenge
2. **Vitesse 1.5x** : Assez lent pour mémoriser, pas trop ennuyeux
3. **Pause TimeAttack** : Fairness - pas de pénalité pour demander aide
4. **Reset séquence utilisateur** : Permet de recommencer proprement

### Futures Améliorations
- [ ] Acheter des indices avec les coins
- [ ] Indices illimités en mode Zen
- [ ] Animation visuelle quand timer pause/reprend
- [ ] Statistiques d'utilisation des indices
- [ ] Mode "hardcore" sans indices

---

## ✅ État d'Implémentation

- ✅ Fonction `useHint()` dans `useGameLogicExtended`
- ✅ Intégration dans `GameScreen.tsx`
- ✅ Pause timer en mode TimeAttack
- ✅ Reprise timer automatique
- ✅ Replay à vitesse réduite (1.5x)
- ✅ Feedback sonore
- ✅ Badge compteur
- ✅ Désactivation automatique (0 indices)
- ✅ Aucune erreur de compilation

---

**Date :** 27 octobre 2025  
**Branche :** 1erDeploimenet  
**Phase :** 10 - Corrections & Améliorations
