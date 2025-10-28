# Debug Navigation Flow

## Scénario: Premier lancement → Onboarding → Login Guest

### État Initial
- `isLoading`: true
- `onboardingDone`: false
- `currentUser`: null
- `currentScreen`: 'onboarding'

### Étape 1: Initialisation
1. useEffect #1 s'exécute: charge audio + vérifie onboarding
   - `hasCompletedOnboarding()` → false
   - `setOnboardingDone(false)`

2. useEffect #2 s'exécute: écoute auth
   - Pas d'utilisateur initialement
   - `setIsLoading(false)`

### Étape 2: Après chargement
- `isLoading`: false
- `onboardingDone`: false
- `currentUser`: null
- `currentScreen`: 'onboarding'

→ useEffect #3: condition `!onboardingDone` → reste sur 'onboarding' ✅

### Étape 3: Utilisateur clique "Commencer"
1. `handleOnboardingComplete()` appelé:
   - `setOnboardingCompleted()` → écrit dans AsyncStorage
   - `setOnboardingDone(true)` ← État local mis à jour immédiatement
   - `transitionToScreen('login')` car `currentUser` est null

### Étape 4: Transition vers Login
- `isLoading`: false
- `onboardingDone`: true ← Changé
- `currentUser`: null
- `currentScreen`: 'login' ← Changé par transitionToScreen

→ useEffect #3 se déclenche car `onboardingDone` a changé
→ Condition: `onboardingDone === true && currentUser === null`
→ Devrait naviguer vers 'login' (déjà le cas) ✅

### Étape 5: Utilisateur clique "Jouer en mode invité"
1. `handleGuestLogin()` appelé:
   - `setIsLoading(true)`
   - `firebaseService.signInAnonymously()`

2. Auth listener (useEffect #2) se déclenche:
   - `setCurrentUser(user)` ← Utilisateur anonyme
   - Charge/initialise userProgress
   - `setIsLoading(false)`

### Étape 6: Après connexion anonyme
- `isLoading`: false
- `onboardingDone`: true
- `currentUser`: { uid: "...", isAnonymous: true } ← Changé
- `currentScreen`: 'login'

→ useEffect #3 se déclenche car `currentUser` a changé
→ Condition: `onboardingDone === true && currentUser !== null && currentScreen === 'login'`
→ **DEVRAIT** naviguer vers 'home' ✅

## Problème Potentiel

Si `setCurrentScreen('home')` est appelé mais que l'écran reste gris:
1. Vérifier que HomeScreen se rend correctement
2. Vérifier que `userProgress` est chargé
3. Vérifier les logs console pour voir les transitions

## Solution Implémentée

- 3 useEffect séparés pour éviter les closures
- État local `onboardingDone` pour éviter race condition avec AsyncStorage
- Navigation conditionnelle basée sur état complet
- Écran de chargement pendant `isLoading`
