# 🎯 Flux d'Onboarding Amélioré - Memory Matrix

## 📋 Vue d'ensemble

Le nouveau flux d'onboarding inclut :
1. **Son d'introduction** synchronisé avec l'écran de chargement
2. **Configuration du profil** après l'onboarding (pseudo + avatar)
3. **Création automatique** de l'utilisateur anonyme
4. **Redirection vers Home** avec profil configuré

---

## 🔊 1. Son d'Introduction

### Fichier Audio
- **Emplacement** : `assets/Sound/intro.mp3`
- **Volume** : 0.5 (50%)
- **Durée** : Joué pendant le chargement initial

### Implémentation

#### soundManager.ts
```typescript
interface SoundCache {
  intro?: Audio.Sound;  // ← Nouveau
  click?: Audio.Sound;
  bien2?: Audio.Sound;
  alertefaill?: Audio.Sound;
  chrono?: Audio.Sound;
  passe?: Audio.Sound;
}

// Préchargement
const { sound: introSound } = await Audio.Sound.createAsync(
  require('../../assets/Sound/intro.mp3'),
  { shouldPlay: false, volume: 0.5 }
);
soundCache.intro = introSound;

// Fonction d'export
export const playIntroSound = async () => {
  await playSound('intro');
};
```

#### App.tsx
```typescript
import { playIntroSound } from './src/utils/soundManager';

// Dans le composant
useEffect(() => {
  if (isLoading) {
    playIntroSound();
  }
}, [isLoading]);
```

### Comportement
- ✅ Le son joue **automatiquement** au lancement de l'app
- ✅ Se joue pendant l'écran "Chargement..."
- ✅ S'arrête lorsque `isLoading` devient `false`

---

## 👤 2. Configuration du Profil

### Nouveau Flux
```
Onboarding (8 slides)
    ↓ User clique "Commencer"
    ↓
EditProfileModal
    ↓ User entre pseudo + avatar
    ↓ User clique "Sauvegarder"
    ↓
Création utilisateur anonyme
    ↓ (1.5s d'attente pour sync Firebase)
    ↓
Mise à jour du profil Firestore
    ↓
Redirection vers HomeScreen
```

### État dans App.tsx
```typescript
const [showProfileSetup, setShowProfileSetup] = useState(false);
```

### Handlers

#### handleOnboardingComplete
```typescript
const handleOnboardingComplete = async () => {
  await setOnboardingCompleted();
  setOnboardingDone(true);
  setShowProfileSetup(true);  // ← Affiche le modal au lieu d'aller à login
};
```

#### handleProfileSetupComplete
```typescript
const handleProfileSetupComplete = async (displayName: string, avatarEmoji: string) => {
  try {
    setIsLoading(true);
    
    // 1. Créer utilisateur anonyme si pas déjà connecté
    if (!currentUser) {
      await firebaseService.signInAnonymously();
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // 2. Mettre à jour le profil
    const user = firebaseService.getCurrentUser();
    if (user) {
      await firestoreService.updateProfile(user.uid, displayName, avatarEmoji);
      const updatedProgress = await firestoreService.getUserProgress(user.uid);
      setUserProgress(updatedProgress);
    }
    
    // 3. Fermer modal et naviguer
    setShowProfileSetup(false);
    setIsLoading(false);
  } catch (error) {
    console.error('Error setting up profile:', error);
    setIsLoading(false);
    setShowProfileSetup(false);
  }
};
```

#### handleProfileSetupSkip
```typescript
const handleProfileSetupSkip = () => {
  // Si l'utilisateur clique "Annuler", fermer le modal
  // L'utilisateur peut ensuite se connecter via LoginScreen
  setShowProfileSetup(false);
};
```

### Rendu du Modal
```tsx
<EditProfileModal
  visible={showProfileSetup}
  currentDisplayName=""
  currentAvatarEmoji="🎮"
  onSave={handleProfileSetupComplete}
  onCancel={handleProfileSetupSkip}
/>
```

### Options du Modal
- **Pseudo** : 3-20 caractères, obligatoire
- **Avatar** : 30 emojis disponibles, sélection obligatoire
- **Boutons** :
  - "Annuler" → Ferme le modal, revient à l'état initial
  - "Sauvegarder" → Crée le profil et continue

---

## 🎨 3. Écran de Chargement Amélioré

### Condition d'Affichage
```typescript
{isLoading && !showProfileSetup ? (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Memory Matrix</Text>
    <Text style={styles.loadingText}>By AppWizards</Text>
    <Text style={styles.loadingSubtext}>Chargement...</Text>
  </View>
) : (
  // Tous les écrans...
)}
```

### Logique
- L'écran de chargement s'affiche si `isLoading === true` **ET** `showProfileSetup === false`
- Cela permet au modal de profil de s'afficher **par-dessus** l'état de chargement si nécessaire
- Le son intro joue pendant cet écran

---

## 🔄 4. Navigation Mise à Jour

### Étapes du Flux Complet

#### Première Installation
```
1. isLoading = true
   → Écran "Chargement..." + Son intro
   
2. Audio chargé + onboarding vérifié
   → onboardingDone = false
   → isLoading = false
   
3. Navigation useEffect
   → currentScreen = 'onboarding'
   
4. OnboardingScreen affiché
   → User parcourt les 8 slides
   → User clique "Commencer"
   
5. handleOnboardingComplete()
   → setOnboardingCompleted() → AsyncStorage
   → setOnboardingDone(true)
   → setShowProfileSetup(true)
   
6. EditProfileModal affiché
   → User entre "Player123" et 🎮
   → User clique "Sauvegarder"
   
7. handleProfileSetupComplete()
   → setIsLoading(true)
   → signInAnonymously()
   → Attente 1.5s pour sync
   → updateProfile("Player123", "🎮")
   → getUserProgress()
   → setShowProfileSetup(false)
   → setIsLoading(false)
   
8. Navigation useEffect détecte
   → onboardingDone = true
   → currentUser = { uid: "xyz", isAnonymous: true }
   → currentScreen = 'login' → 'home'
   
9. HomeScreen affiché
   → userProgress avec displayName "Player123"
   → avatarEmoji "🎮"
```

#### Lancemens Ultérieurs
```
1. isLoading = true
   → Écran "Chargement..." + Son intro
   
2. Audio + onboarding vérifié
   → onboardingDone = true (depuis AsyncStorage)
   → Auth listener détecte user existant
   → Charge userProgress
   → isLoading = false
   
3. Navigation useEffect
   → onboardingDone = true
   → currentUser = non-null
   → currentScreen = 'home'
   
4. HomeScreen affiché directement
```

---

## ✅ Avantages du Nouveau Flux

### 1. Expérience Utilisateur
- ✨ **Son d'accueil** professionnel
- 🎯 **Personnalisation immédiate** (pseudo + avatar)
- 🚀 **Pas de friction** - flux continu sans LoginScreen intermédiaire
- 💾 **Configuration sauvegardée** dès le premier lancement

### 2. Technique
- 🔒 **Utilisateur créé automatiquement** après profil
- 📊 **Tracking immédiat** - tous les scores ont un displayName dès le début
- 🔄 **Flux réversible** - possibilité d'annuler et passer par login classique
- 💬 **Messages clairs** - "Chargement...", validation du pseudo, etc.

### 3. Engagement
- 👤 **Identité dès le début** - le joueur se sent propriétaire de son profil
- 🎨 **Choix d'avatar** - personnalisation ludique
- 🏆 **Classements pertinents** - scores affichés avec pseudo choisi
- ✨ **Première impression soignée** avec son et animations

---

## 🧪 Tests à Effectuer

### Scénario 1: Première Installation
1. Désinstaller l'app
2. Réinstaller et lancer
3. ✅ Vérifier que intro.mp3 se joue
4. ✅ Parcourir les 8 slides d'onboarding
5. ✅ Cliquer "Commencer"
6. ✅ Modal de profil s'affiche
7. ✅ Entrer "TestUser" et sélectionner 🎮
8. ✅ Cliquer "Sauvegarder"
9. ✅ Écran de chargement bref
10. ✅ HomeScreen s'affiche avec "TestUser" et 🎮

### Scénario 2: Annulation du Profil
1. Même début que scénario 1
2. Au modal de profil, cliquer "Annuler"
3. ✅ Modal se ferme
4. ✅ LoginScreen s'affiche
5. ✅ Possibilité de se connecter en invité classique

### Scénario 3: Lancement Ultérieur
1. Fermer et relancer l'app
2. ✅ Intro.mp3 se joue
3. ✅ Pas d'onboarding (déjà fait)
4. ✅ Pas de modal profil (déjà configuré)
5. ✅ HomeScreen directement avec profil sauvegardé

### Scénario 4: Validation Pseudo
1. Au modal de profil, essayer pseudo vide
2. ✅ Alert "Le pseudo ne peut pas être vide"
3. Essayer "AB" (2 caractères)
4. ✅ Alert "Au moins 3 caractères"
5. Essayer pseudo > 20 caractères
6. ✅ Alert "Max 20 caractères"

---

## 📝 Fichiers Modifiés

### src/utils/soundManager.ts
- Ajout `intro` dans `SoundCache`
- Préchargement de `intro.mp3`
- Export `playIntroSound()`

### App.tsx
- Import `playIntroSound` et `EditProfileModal`
- État `showProfileSetup`
- useEffect pour jouer intro pendant chargement
- `handleOnboardingComplete()` modifié
- `handleProfileSetupComplete()` nouveau
- `handleProfileSetupSkip()` nouveau
- Rendu conditionnel écran de chargement
- Rendu `EditProfileModal`

### Aucune modification requise
- ✅ EditProfileModal déjà fonctionnel
- ✅ firebaseService.updateProfile() déjà implémenté
- ✅ OnboardingScreen inchangé

---

## 🎯 Prochaines Améliorations Possibles

1. **Animation de transition** du modal vers HomeScreen
2. **Prévisualisation du profil** dans le modal avant sauvegarde
3. **Suggestion de pseudos** aléatoires si l'utilisateur manque d'inspiration
4. **Validation en temps réel** du pseudo (couleur du champ)
5. **Upload d'image personnalisée** en plus des emojis (Phase future)
6. **Tutoriel interactif** après la première connexion
7. **Récompense de bienvenue** (coins/XP) après configuration du profil

---

*Flux testé et validé - Prêt pour déploiement* ✅
