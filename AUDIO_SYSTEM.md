# 🔊 Système Audio - Memory Matrix

## 📋 Vue d'ensemble

Le système audio de Memory Matrix utilise **expo-av** pour la gestion des sons et **expo-haptics** pour le retour tactile. Tous les sons sont préchargés au démarrage de l'application pour une lecture instantanée.

---

## 🎵 Fichiers Audio

### Emplacement
Tous les fichiers audio sont dans : `assets/Sound/`

### Liste des Sons

| Fichier | Usage | Déclenchement | Volume |
|---------|-------|---------------|--------|
| `click.mp3` | Clic sur cellule | Quand le joueur clique sur une cellule pendant la saisie | 0.6 |
| `bien2.mp3` | Séquence réussie | Quand le joueur reproduit correctement la séquence complète | 0.7 |
| `alertefaill.mp3` | Game Over | Quand le joueur perd toutes ses vies | 0.8 |
| `CHRONO.mp3` | Timer actif | **UNIQUEMENT en mode Contre-la-Montre** (boucle continue) | 0.5 |

---

## 🛠️ Architecture Technique

### Initialisation
```typescript
// Dans App.tsx
import { initializeAudio } from './src/utils/soundManager';

useEffect(() => {
  const initialize = async () => {
    await initializeAudio(); // Charge tous les sons et préférences
  };
  initialize();
}, []);
```

### Préchargement des Sons
Tous les sons sont chargés en mémoire au démarrage via `preloadSounds()`:
- Meilleure performance (pas de latence)
- Évite les délais de chargement pendant le jeu
- Utilise `Audio.Sound.createAsync()`

### Configuration Audio
```typescript
await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,        // Joue même en mode silencieux
  staysActiveInBackground: false,     // Ne joue pas en arrière-plan
  shouldDuckAndroid: true,            // Baisse le volume des autres apps
  playThroughEarpieceAndroid: false,  // Utilise le haut-parleur principal
});
```

---

## 🎮 Intégration Gameplay

### Mode Contre-la-Montre (Time Attack)
Le son `CHRONO.mp3` joue **uniquement** dans ce mode:

```typescript
// Dans useGameLogicExtended.ts
useEffect(() => {
  if (mode === 'timeAttack' && gameStatus === 'playing' && !isPaused) {
    startChronoSound(); // Démarre la boucle
  } else {
    stopChronoSound(); // Arrête le son
  }
  
  return () => {
    stopChronoSound(); // Nettoyage
  };
}, [gameStatus, isPaused, mode]);
```

### Clic sur Cellule
```typescript
// Joué à chaque clic du joueur pendant la saisie
feedback.cellClick(); // Son + haptic
```

### Séquence Réussie
```typescript
// Quand le joueur reproduit correctement toute la séquence
feedback.correct(); // bien2.mp3 + haptic success
```

### Game Over
```typescript
// Quand toutes les vies sont perdues
feedback.gameOver(); // alertefaill.mp3 + haptic heavy
```

---

## 🔇 Système de Préférences

### Activation/Désactivation
Les utilisateurs peuvent désactiver les sons et/ou les vibrations via le **SettingsModal**.

### Persistance
Les préférences sont sauvegardées dans **AsyncStorage**:
```typescript
const STORAGE_KEYS = {
  SOUND_ENABLED: '@MemoryMatrix:soundEnabled',
  HAPTICS_ENABLED: '@MemoryMatrix:hapticsEnabled',
};
```

### Fonctions Publiques
```typescript
// Récupérer l'état actuel
const isSoundOn = getAudioEnabled();
const isHapticsOn = getHapticsEnabled();

// Modifier les préférences
await setAudioEnabled(true/false);
await setHapticsEnabled(true/false);
```

---

## 🚫 Prévention du Chevauchement

### Mécanisme
Chaque fois qu'un son est joué:
1. Vérifie si le son est déjà en cours de lecture
2. Si oui, arrête le son et revient au début
3. Lance la nouvelle lecture

```typescript
const playSound = async (soundKey: keyof SoundCache) => {
  const sound = soundCache[soundKey];
  const status = await sound.getStatusAsync();
  
  if (status.isLoaded && status.isPlaying) {
    await sound.stopAsync(); // Arrête si déjà en cours
  }
  
  await sound.setPositionAsync(0); // Revient au début
  await sound.playAsync();         // Relance
};
```

### Exception: CHRONO
Le son chrono est géré différemment car c'est une boucle continue:
- `isChronoPlaying` flag global pour éviter les redémarrages
- `startChronoSound()` ne fait rien si déjà en cours
- `stopChronoSound()` arrête proprement la boucle

---

## 📱 Composant SettingsModal

### Utilisation
```typescript
import { SettingsModal } from './src/components/SettingsModal';

const [showSettings, setShowSettings] = useState(false);

<SettingsModal 
  visible={showSettings} 
  onClose={() => setShowSettings(false)} 
/>
```

### Fonctionnalités
- ✅ Toggle Sons (sauvegarde automatique)
- ✅ Toggle Vibrations (sauvegarde automatique)
- ✅ Interface simple et claire
- ✅ Changements appliqués immédiatement

---

## 🧹 Nettoyage Mémoire

### À l'arrêt de l'application
```typescript
await cleanupSounds(); // Décharge tous les sons de la mémoire
```

Cette fonction:
1. Arrête le son chrono s'il est en cours
2. Décharge tous les sons avec `unloadAsync()`
3. Vide le cache

---

## 📊 Retour Haptique

### Types de Vibrations
| Fonction | Intensité | Usage |
|----------|-----------|-------|
| `playHapticLight()` | Légère | Clics, boutons |
| `playHapticMedium()` | Moyenne | Level up |
| `playHapticHeavy()` | Forte | Game over |
| `playHapticSuccess()` | Notification succès | Séquence correcte |
| `playHapticError()` | Notification erreur | Mauvaise saisie |
| `playHapticWarning()` | Notification avertissement | (réservé) |

### Helper `feedback`
Combine son + haptic pour une meilleure expérience:

```typescript
feedback.cellClick();    // click.mp3 + haptic light
feedback.correct();      // bien2.mp3 + haptic success
feedback.wrong();        // haptic error (pas de son)
feedback.gameOver();     // alertefaill.mp3 + haptic heavy
feedback.levelUp();      // haptic medium (pas de son)
feedback.buttonPress();  // haptic light (pas de son)
```

---

## 🔍 Débogage

### Logs Console
Le système audio log les événements importants:
```
✅ All sounds preloaded successfully
🔊 Chrono sound started
🔇 Chrono sound stopped
🧹 All sounds cleaned up
```

### Vérifications
1. **Sons ne jouent pas** : Vérifier que `audioEnabled === true`
2. **Chrono joue dans mauvais mode** : Vérifier `gameModeState.mode === 'timeAttack'`
3. **Sons se coupent** : Normal, c'est la prévention du chevauchement
4. **Préférences non sauvegardées** : Vérifier AsyncStorage

---

## 📝 Checklist Développeur

Avant de déployer:
- [ ] Tous les fichiers audio existent dans `assets/Sound/`
- [ ] `initializeAudio()` est appelé dans `App.tsx`
- [ ] Son chrono joue **uniquement** en mode Time Attack
- [ ] Préférences audio persistent après redémarrage
- [ ] SettingsModal accessible depuis HomeScreen
- [ ] Aucun chevauchement de sons
- [ ] Cleanup appelé lors de l'unmount
- [ ] Tests sur appareil réel (pas seulement simulateur)

---

## 🎯 Améliorations Futures

- [ ] Ajouter un son pour l'affichage de la séquence
- [ ] Son pour les power-ups/hints
- [ ] Musique d'ambiance (optionnelle)
- [ ] Sons thématiques par mode de jeu
- [ ] Contrôle du volume par slider
- [ ] Effets sonores spatialisés (3D audio)

---

*Dernière mise à jour: 28 octobre 2025*
