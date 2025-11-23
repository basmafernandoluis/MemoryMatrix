# 🐛 DIAGNOSTIC - Animations Phase 2

## Problème Rapporté
"Quand je reproduis la séquence rien ne se passe, ni quand je clique sur la bonne séquence ni quand j'erronne"

---

## ✅ Corrections Appliquées

### 1. Réinitialisation des Animations
**Problème potentiel:** Les animations shake/juice ne se réinitialisaient pas entre les différents états

**Solution:**
```typescript
// Shake - Reset avant de commencer
if (gameStatus === 'wrong' && isInUserSequence) {
  shakeAnim.setValue(0);  // ← Reset
  // ... animation
} else {
  shakeAnim.setValue(0);  // ← Reset quand pas wrong
}

// Juice - Reset avant de commencer
if (gameStatus === 'correct' && isInUserSequence) {
  juiceAnim.setValue(1);  // ← Reset
  // ... animation
} else {
  juiceAnim.setValue(1);  // ← Reset quand pas correct
}
```

### 2. Dépendances useEffect
**Problème potentiel:** Les animations ne se re-déclenchaient pas

**Solution:** Ajout des dépendances manquantes
```typescript
// Avant
}, [gameStatus, isInUserSequence]);

// Après
}, [gameStatus, isInUserSequence, shakeAnim]);
}, [gameStatus, isInUserSequence, juiceAnim, colors.cellCorrect]);
```

### 3. Particules au Clic
**Modification:** Ajout du paramètre `intensity` explicite
```typescript
// Avant
particleRef.current?.trigger(x, y, colors.primary);

// Après
particleRef.current?.trigger(x, y, colors.primary, 'medium');
```

---

## 🔍 Checklist de Diagnostic

### Test 1: Particules au Clic Normal
**Comment tester:**
1. Démarre le jeu
2. Attends que la séquence se montre
3. Clique sur **N'IMPORTE QUELLE** cellule

**Résultat attendu:**
- ✨ Particules apparaissent au centre de la cellule
- 🎵 Son joue (pitch dynamique)
- Types variés : ⭐ étoiles, ❤️ cœurs, ✨ sparkles, ➕ plus, ⚪ cercles

**Si ça ne marche PAS:**
→ Problème avec `ClickParticles` lui-même

**Si ça marche:**
→ ClickParticles OK, problème avec animations shake/juice

---

### Test 2: Shake sur Erreur
**Comment tester:**
1. Démarre le jeu
2. Mémorise la séquence (ex: 1-2-3)
3. Clique volontairement sur la MAUVAISE cellule (ex: 4)

**Résultat attendu:**
- 💥 Cellule **secoue** horizontalement (4-5 fois rapidement)
- 🔴 Cellule devient **rouge** (colors.cellIncorrect)
- 🎵 Son "wrong" joue
- Durée: ~250ms

**Si ça ne marche PAS:**
→ Vérifier que `gameStatus` passe bien à `'wrong'`
→ Vérifier que `isInUserSequence` est bien `true`

---

### Test 3: Juice sur Succès
**Comment tester:**
1. Démarre le jeu
2. Mémorise la séquence (ex: 1-2-3)
3. Reproduis la séquence CORRECTEMENT (1 puis 2 puis 3)

**Résultat attendu:**
- 🎉 Cellules font un **bounce** (grossissent 1.15x puis reviennent)
- ⭐ **Étoiles dorées** apparaissent (12 particules large)
- 🟢 Cellules deviennent **vertes** (colors.cellCorrect)
- 🎵 Son "correct" joue

**Si ça ne marche PAS:**
→ Vérifier que `gameStatus` passe bien à `'correct'`
→ Vérifier que `isInUserSequence` est bien `true`

---

## 🔬 Debugging Avancé

### Console Logs à Ajouter

Si rien ne fonctionne, ajoute ces logs dans `GameGrid.tsx` :

```typescript
// Dans le useEffect shake
useEffect(() => {
  console.log('🔴 SHAKE CHECK:', { gameStatus, isInUserSequence, index });
  if (gameStatus === 'wrong' && isInUserSequence) {
    console.log('🔴 SHAKE TRIGGERED for cell', index);
    // ... animation
  }
}, [gameStatus, isInUserSequence, shakeAnim]);

// Dans le useEffect juice
useEffect(() => {
  console.log('🟢 JUICE CHECK:', { gameStatus, isInUserSequence, index });
  if (gameStatus === 'correct' && isInUserSequence) {
    console.log('🟢 JUICE TRIGGERED for cell', index);
    // ... animation
  }
}, [gameStatus, isInUserSequence, juiceAnim, colors.cellCorrect]);

// Dans handlePress
const handlePress = async () => {
  console.log('👆 CELL CLICKED:', index);
  await playSequenceStepSound(currentStep);
  
  console.log('✨ PARTICLES TRIGGERED at:', GAME_CONFIG.CELL_SIZE / 2);
  particleRef.current?.trigger(
    GAME_CONFIG.CELL_SIZE / 2, 
    GAME_CONFIG.CELL_SIZE / 2, 
    colors.primary,
    'medium'
  );
  
  onPress(index);
};
```

---

## 🎯 Scénarios Possibles

### Scénario A: Aucune particule n'apparaît
**Cause probable:** ClickParticles n'est pas monté ou mal positionné

**Solutions:**
1. Vérifier que `<ClickParticles ref={particleRef} />` est bien dans le composant
2. Vérifier que `particleRef.current` n'est pas `null`
3. Vérifier les styles `StyleSheet.absoluteFill` dans ClickParticles

### Scénario B: Particules OK mais pas de shake/juice
**Cause probable:** `gameStatus` ou `isInUserSequence` ne changent pas

**Solutions:**
1. Vérifier dans `useGameLogic.ts` que `setGameStatus('wrong')` et `setGameStatus('correct')` sont appelés
2. Vérifier que `isInUserSequence` est bien calculé dans GameGrid parent

### Scénario C: Shake/Juice se lancent mais pas visibles
**Cause probable:** Animations trop rapides ou trop petites

**Solutions:**
1. Augmenter les valeurs de shake (10 → 20)
2. Augmenter le scale juice (1.15 → 1.3)
3. Augmenter les durées

---

## 🛠️ Modifications Rapides à Tester

### Rendre le Shake Plus Visible
```typescript
Animated.sequence([
  Animated.timing(shakeAnim, { toValue: 20, duration: 100, useNativeDriver: true }),  // ← 20 au lieu de 10
  Animated.timing(shakeAnim, { toValue: -20, duration: 100, useNativeDriver: true }),
  Animated.timing(shakeAnim, { toValue: 20, duration: 100, useNativeDriver: true }),
  Animated.timing(shakeAnim, { toValue: -20, duration: 100, useNativeDriver: true }),
  Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
]).start();
```

### Rendre le Juice Plus Visible
```typescript
Animated.spring(juiceAnim, { 
  toValue: 1.3,  // ← 1.3 au lieu de 1.15
  friction: 2,   // ← Plus rebondy
  tension: 300,  // ← Plus rapide
  useNativeDriver: true 
}),
```

---

## 📊 État Actuel du Code

### ClickParticles.tsx
- ✅ 5 types de particules
- ✅ 4 intensités
- ✅ Rotation 360°
- ✅ Scale bounce 0 → 1.2 → 0.2
- ✅ Interface `trigger(x, y, color?, intensity?, type?)`

### GameGrid.tsx
- ✅ Shake animation (translateX ±10px, 5 étapes)
- ✅ Juice animation (scale 1.15x bounce)
- ✅ Reset automatique des animations
- ✅ Particules star large sur succès
- ✅ Dépendances useEffect complètes

---

## 📝 Prochaines Étapes

1. **Rebuild l'APK** : `cd android; ./gradlew assembleDebug`
2. **Installe sur device**
3. **Teste les 3 scénarios** ci-dessus
4. **Rapporte** quel scénario correspond au problème
5. **Ajoute les logs** si besoin pour identifier la cause exacte

---

*Document créé le 23 novembre 2025*  
*Memory Matrix - Debug Phase 2 Animations*
