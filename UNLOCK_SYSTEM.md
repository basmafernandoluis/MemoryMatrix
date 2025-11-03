# 🎮 Système de Déblocage Progressif des Modes - v1.2.0

## 📅 Date de Mise à Jour
**31 octobre 2025**

---

## 🎯 Objectif de la Mise à Jour

Implémenter un système de déblocage progressif des modes de jeu pour améliorer la rétention des joueurs et créer un sentiment de progression satisfaisant.

---

## ✨ Nouvelles Fonctionnalités

### 1. Système de Déblocage Progressif

#### Conditions de Déblocage par Mode

| Mode | Condition de Déblocage | Description |
|------|------------------------|-------------|
| **Classique** | Toujours débloqué | Mode de base, accessible immédiatement |
| **Survie** | Niveau 3 atteint | Déblocage par progression |
| **Contre-la-Montre** | Niveau 5 atteint | Déblocage par progression |
| **Zen** | Niveau 7 atteint | Déblocage par progression |
| **Personnalisé** | 500 XP + 100 Coins | Déblocage par ressources |

#### Logique de Déblocage

```typescript
// Fonction isModeUnlocked mise à jour
export const isModeUnlocked = (
  mode: GameMode, 
  maxLevelReached: number,
  userXp: number = 0,
  userCoins: number = 0
): boolean => {
  // Vérifie niveau requis
  // Vérifie XP requis
  // Vérifie Coins requis
  return true/false;
};
```

### 2. Nouvelle Interface Grid

#### Avant (Carousel)
- Défilement horizontal
- Un seul mode visible à la fois
- Navigation par swipe
- Design immersif mais moins pratique

#### Après (Grid)
- Tous les modes visibles simultanément
- Layout 2 colonnes
- Design compact inspiré des cards Succès
- Vue d'ensemble instantanée

#### Avantages du Grid
- ✅ Meilleure visibilité des modes disponibles
- ✅ Progression claire (modes lockés visibles)
- ✅ Design cohérent avec le reste de l'app
- ✅ Moins de navigation requise

### 3. Animation de Déblocage

#### Composant `UnlockModeAnimation`

Animation affichée quand un mode est débloqué :
- 🎉 Apparition avec effet de scale et rotation
- ✨ Effet glow pulsant
- 🎊 Confettis en arrière-plan
- 🏆 Badge "Nouveau" animé
- ⏱️ Auto-fermeture après 3 secondes

#### Déclenchement

```typescript
// Dans HomeScreen, via props
<HomeScreen 
  newlyUnlockedMode={modeToUnlock}
  // ... autres props
/>

// L'animation se déclenche automatiquement via useEffect
```

### 4. Service de Déblocage

#### `modeUnlockService.ts`

Nouveau service pour gérer :
- Sauvegarde locale des modes débloqués (AsyncStorage)
- Détection automatique de déblocage
- Historique des déblocages
- Sync avec Firestore (préparé)

Fonctions principales :
- `getUnlockedModes()` - Récupère les modes débloqués
- `unlockMode()` - Sauvegarde un mode débloqué
- `checkModeUnlock()` - Détecte si un déblocage vient d'avoir lieu
- `getRecentlyUnlockedModes()` - Liste des déblocages récents

---

## 📁 Fichiers Modifiés

### Fichiers Créés

1. **`src/services/modeUnlockService.ts`**
   - Service de gestion des déblocages
   - Persistance locale et cloud
   - Détection automatique

2. **`src/components/UnlockModeAnimation.tsx`**
   - Animation de célébration
   - Effets visuels (scale, rotate, glow)
   - Confettis intégrés

### Fichiers Modifiés

1. **`src/constants/gameModes.ts`**
   - Ajout interface `UnlockRequirements`
   - Ajout `GameModeConfigExtended`
   - Mise à jour `isModeUnlocked()` avec paramètres XP/Coins
   - Configuration des requirements par mode

2. **`src/screens/GameModeSelector.tsx`**
   - Refonte complète en grid layout
   - Suppression du carousel horizontal
   - Nouveau design compact style cards Succès
   - Affichage badges lock avec requirements
   - Props `userXp` et `userCoins` ajoutées

3. **`src/screens/HomeScreen.tsx`**
   - Import `UnlockModeAnimation`
   - Ajout états `unlockedMode` et `showUnlockAnimation`
   - Nouvelle prop `newlyUnlockedMode`
   - useEffect pour déclencher animation
   - Passage XP/Coins à GameModeSelector

---

## 🎨 Design System

### Style des Cards Modes (Inspiré Succès)

```typescript
modeCard: {
  backgroundColor: COLORS.surface,
  padding: SPACING.md,
  borderRadius: BORDER_RADIUS.md,
  width: (SCREEN_WIDTH - SPACING.md * 3) / 2, // 2 colonnes
  minHeight: 160,
  borderWidth: 2,
  borderColor: COLORS.success, // Vert si débloqué
  ...SHADOW.medium,
}

modeCardLocked: {
  opacity: 0.6,
  borderColor: COLORS.textSecondary, // Gris si locké
}
```

### Éléments Visuels

- **Icône** : 40px, emoji du mode
- **Titre** : FONT_SIZE.md, bold
- **Description** : 10px, color secondary
- **Features** : Compact, inline (❤️ 5, ⏱️ 120s)
- **Lock Badge** : Fond semi-transparent, texte requirements
- **Unlock Badge** : Checkmark vert en coin supérieur droit

---

## 🔄 Flow Utilisateur

### Scénario 1 : Déblocage par Niveau

```
1. Joueur atteint niveau 3 en mode Classique
2. GameOverScreen détecte le déblocage (checkModeUnlock)
3. Mode Survie est débloqué
4. Retour HomeScreen avec newlyUnlockedMode='survival'
5. Animation de déblocage se déclenche
6. Joueur voit "🎉 MODE DÉBLOQUÉ ! 🎉"
7. Confettis + animation glow
8. Auto-fermeture après 3s
9. Mode Survie maintenant accessible dans le sélecteur
```

### Scénario 2 : Déblocage par Ressources

```
1. Joueur accumule 500 XP et 100 Coins
2. Ouvre le sélecteur de modes
3. Voit mode Personnalisé avec badge "500 XP • 100 🪙"
4. Peut cliquer pour débloquer (feature future)
5. Animation de déblocage
6. XP/Coins déduits
7. Mode disponible
```

---

## 📊 Équilibrage

### Progression Recommandée

| Niveau Joueur | Modes Disponibles | Expérience |
|---------------|-------------------|------------|
| 1-2 | Classique | Apprentissage |
| 3-4 | Classique + Survie | Diversification |
| 5-6 | +Contre-la-Montre | Challenge |
| 7+ | +Zen | Relaxation |
| 500 XP | +Personnalisé | Personnalisation |

### Temps Estimé pour Déblocage

- **Survie (Niveau 3)** : ~5-10 minutes de jeu
- **Time Attack (Niveau 5)** : ~10-15 minutes
- **Zen (Niveau 7)** : ~15-20 minutes
- **Custom (500 XP)** : ~30-45 minutes

---

## 🧪 Tests Recommandés

### Tests Fonctionnels

- [ ] Mode Classique toujours accessible
- [ ] Modes lockés affichent le bon requirement
- [ ] Déblocage au bon moment (niveau 3, 5, 7)
- [ ] Animation se déclenche correctement
- [ ] XP/Coins affichés et pris en compte
- [ ] Grid responsive sur différentes tailles d'écran

### Tests Visuels

- [ ] Cards alignées correctement en grid 2 colonnes
- [ ] Lock badges lisibles
- [ ] Checkmark visible sur modes débloqués
- [ ] Animation fluide sans lag
- [ ] Confettis ne cachent pas le contenu

### Tests Edge Cases

- [ ] Déblocage simultané de plusieurs modes
- [ ] XP/Coins exactement égaux au requirement
- [ ] Nouveau joueur (seulement Classique)
- [ ] Joueur vétéran (tout débloqué)

---

## 🚀 Prochaines Étapes

### Court Terme (Optionnel)
1. **Bouton "Débloquer maintenant"** pour mode Custom
   - Si joueur a assez de XP/Coins
   - Modal de confirmation
   - Déduction des ressources
   - Animation de déblocage

2. **Historique des déblocages**
   - Page dans ProfileScreen
   - "Vous avez débloqué Survie il y a 2 jours"
   - Statistiques par mode depuis déblocage

3. **Notifications push**
   - "Encore 1 niveau pour débloquer Time Attack !"
   - "Vous pouvez débloquer un nouveau mode !"

### Moyen Terme
1. **Modes temporaires**
   - Mode événementiel (Halloween, Noël)
   - Déblocage gratuit pendant l'événement
   - Badge spécial si complété pendant l'event

2. **Achievements liés aux déblocages**
   - "Collectionneur" : Débloquer tous les modes
   - "Rapide" : Débloquer Survie en moins de 10 min
   - "Économe" : Débloquer Custom sans acheter de Coins

---

## 📝 Notes Techniques

### Performance
- Grid layout : Pas de virtualisation (seulement 5 modes)
- Animation : Native driver utilisé (60 fps)
- AsyncStorage : Lecture au démarrage seulement

### Compatibilité
- React Native 0.72+
- Expo SDK ~52
- Android 5.0+ (API 21+)
- iOS 13+

### Limitations Connues
- Déblocage par XP/Coins non complètement implémenté (bouton manquant)
- Sync Firestore préparé mais non activé
- Pas de système de refund si le joueur veut "re-lock" un mode

---

## 🎓 Guide d'Intégration Future

### Pour intégrer le déblocage dans GameOverScreen

```typescript
import { checkModeUnlock } from '../services/modeUnlockService';

// Dans le useEffect de fin de jeu
const oldProgress = { /* ancienne progression */ };
const newProgress = { /* nouvelle progression */ };

// Vérifier tous les modes
for (const mode of Object.keys(GAME_MODES)) {
  const result = await checkModeUnlock(
    mode,
    oldProgress.maxLevelReached,
    newProgress.maxLevelReached,
    oldProgress.xp,
    newProgress.xp,
    oldProgress.coins,
    newProgress.coins
  );
  
  if (result.unlocked) {
    // Passer le mode à HomeScreen
    navigation.navigate('Home', { 
      newlyUnlockedMode: mode 
    });
    break; // Une animation à la fois
  }
}
```

---

**Auteur :** GitHub Copilot  
**Version :** 1.2.0  
**Date :** 31 octobre 2025
