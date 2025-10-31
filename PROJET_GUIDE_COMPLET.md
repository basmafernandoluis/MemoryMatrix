# 📱 Guide Complet - Projet React Native Expo avec Firebase

**Basé sur : Memory Matrix**  
**Date de création : Octobre 2025**  
**Stack : React Native + Expo + TypeScript + Firebase**

---

## 📋 Table des Matières

1. [Configuration Initiale](#configuration-initiale)
2. [Dépendances & Packages](#dépendances--packages)
3. [Configuration Firebase](#configuration-firebase)
4. [Architecture du Projet](#architecture-du-projet)
5. [Méthodologie de Développement](#méthodologie-de-développement)
6. [Build & Déploiement](#build--déploiement)
7. [Anomalies Courantes & Solutions](#anomalies-courantes--solutions)
8. [Best Practices](#best-practices)
9. [Checklist de Projet](#checklist-de-projet)

---

## 🚀 Configuration Initiale

### Prérequis
```bash
# Node.js & npm
node --version  # v18+ recommandé
npm --version   # v9+

# Expo CLI
npm install -g expo-cli

# Firebase CLI
npm install -g firebase-tools

# Android Studio (pour les builds Android)
# JDK 11 ou 17
```

### Création du Projet
```bash
# Initialiser avec TypeScript
npx create-expo-app@latest MonProjet --template expo-template-blank-typescript

cd MonProjet

# Initialiser Git
git init
git add .
git commit -m "Initial commit"
```

---

## 📦 Dépendances & Packages

### Package.json Complet

```json
{
  "name": "memory-matrix",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "prebuild": "expo prebuild",
    "prebuild:clean": "expo prebuild --clean"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-native-firebase/app": "^18.0.0",
    "@react-native-firebase/auth": "^18.0.0",
    "@react-native-firebase/firestore": "^18.0.0",
    "expo": "~52.0.0",
    "expo-av": "~16.0.7",
    "expo-haptics": "~15.0.7",
    "expo-linear-gradient": "~14.0.1",
    "expo-status-bar": "~2.0.0",
    "firebase": "^10.7.1",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "react-native-safe-area-context": "4.12.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~18.3.12",
    "typescript": "^5.3.3"
  }
}
```

### Installation des Dépendances

```bash
# Core
npm install expo expo-status-bar react react-native

# Navigation & UI
npm install react-native-safe-area-context

# Stockage
npm install @react-native-async-storage/async-storage

# Firebase
npm install firebase
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore

# Audio & Feedback
npm install expo-av expo-haptics

# Effets visuels
npm install expo-linear-gradient

# TypeScript
npm install --save-dev @types/react typescript
```

### Versions Importantes

| Package | Version | Notes |
|---------|---------|-------|
| expo | ~52.0.0 | SDK 52 |
| react-native | 0.76.5 | Compatible Expo 52 |
| firebase | ^10.7.1 | Firebase v10 |
| expo-av | ~16.0.7 | Audio/Vidéo |
| expo-haptics | ~15.0.7 | Vibrations |
| @react-native-async-storage/async-storage | 2.2.0 | Stockage local |

---

## 🔥 Configuration Firebase

### Étape 1 : Console Firebase

1. **Créer un projet** sur [Firebase Console](https://console.firebase.google.com/)
2. **Activer les services** :
   - ✅ Authentication (Anonymous + Email/Password)
   - ✅ Firestore Database
   - ✅ Storage (optionnel)

### Étape 2 : Configuration Android

1. **Ajouter une app Android** dans Firebase Console
2. **Package name** : `com.votreentreprise.votreapp`
3. **Télécharger** `google-services.json`
4. **Placer** le fichier :
   ```
   android/app/google-services.json
   ```

### Étape 3 : Configuration Web/SDK

Créer `firebaseConfig.ts` :

```typescript
// src/services/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Étape 4 : Règles Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leaderboard - lecture publique
    match /leaderboard/{entry} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // DisplayNames - pour unicité des pseudos
    match /displayNames/{name} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Étape 5 : Index Firestore

Créer `firestore.indexes.json` :

```json
{
  "indexes": [
    {
      "collectionGroup": "leaderboard",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "gameMode", "order": "ASCENDING" },
        { "fieldPath": "period", "order": "ASCENDING" },
        { "fieldPath": "score", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "leaderboard",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "gameMode", "order": "ASCENDING" },
        { "fieldPath": "score", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Déployer les index :
```bash
firebase deploy --only firestore:indexes
```

---

## 🏗️ Architecture du Projet

### Structure des Dossiers

```
projet/
├── app.json                    # Config Expo
├── package.json
├── tsconfig.json
├── App.tsx                     # Point d'entrée
├── index.ts
├── google-services.json        # Firebase Android
│
├── assets/
│   ├── images/
│   └── Sound/                  # Fichiers audio
│       ├── intro.mp3
│       ├── click.mp3
│       ├── bien2.mp3
│       ├── alertefaill.mp3
│       ├── CHRONO.mp3
│       └── passe.mp3
│
├── src/
│   ├── components/             # Composants réutilisables
│   │   ├── ClickParticles.tsx
│   │   ├── ConfettiEffect.tsx
│   │   ├── EditProfileModal.tsx
│   │   ├── GameGrid.tsx
│   │   ├── GameHeader.tsx
│   │   ├── PauseModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── ShineEffect.tsx
│   │   └── StatusMessage.tsx
│   │
│   ├── screens/                # Écrans de l'app
│   │   ├── HomeScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── GameOverScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   ├── ChallengesScreen.tsx
│   │   └── GameModeSelector.tsx
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useGameLogic.ts
│   │   └── useGameLogicExtended.ts
│   │
│   ├── services/               # Services externes
│   │   ├── firebase.ts
│   │   ├── firestore.ts
│   │   └── leaderboard.ts
│   │
│   ├── utils/                  # Utilitaires
│   │   ├── soundManager.ts
│   │   ├── GameEngine.ts
│   │   ├── achievements.ts
│   │   └── storage.ts
│   │
│   ├── constants/              # Constantes
│   │   ├── gameConfig.ts
│   │   ├── designTokens.ts
│   │   └── gameModes.ts
│   │
│   └── types/                  # Types TypeScript
│       └── index.ts
│
└── android/                    # Configuration Android
    ├── app/
    │   ├── build.gradle
    │   └── google-services.json
    ├── build.gradle
    └── gradle.properties
```

### Patterns d'Architecture

#### 1. **Services Layer**
Séparer la logique métier de l'UI :
```typescript
// src/services/firestore.ts
class FirestoreService {
  async getUserProgress(userId: string): Promise<UserProgress> {
    // Logique Firestore
  }
  
  async updateHighScore(userId: string, score: number): Promise<void> {
    // Logique de mise à jour
  }
}

export const firestoreService = new FirestoreService();
```

#### 2. **Custom Hooks**
Encapsuler la logique d'état :
```typescript
// src/hooks/useGameLogic.ts
export const useGameLogic = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  
  const handlePlayerInput = useCallback((index: number) => {
    // Logique de jeu
  }, []);
  
  return { score, level, handlePlayerInput };
};
```

#### 3. **Design Tokens**
Centraliser les styles :
```typescript
// src/constants/designTokens.ts
export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24
};

export const COLORS = {
  primary: '#4CAF50',
  background: '#1a1a2e',
  surface: '#16213e'
};
```

---

## 🛠️ Méthodologie de Développement

### Workflow Git

```bash
# Créer une branche par feature
git checkout -b feature/audio-system
git checkout -b fix/scroll-modal
git checkout -b refactor/game-logic

# Commits descriptifs
git commit -m "feat: Add intro sound on loading screen"
git commit -m "fix: Correct scroll issue in instructions modal"
git commit -m "refactor: Separate useEffect for navigation logic"

# Merge sur main
git checkout main
git merge feature/audio-system
```

### Développement Itératif

**Phase 1 : MVP (Minimum Viable Product)**
- [ ] Architecture de base
- [ ] Écran principal fonctionnel
- [ ] Logique de jeu core
- [ ] Sauvegarde locale

**Phase 2 : Features Essentielles**
- [ ] Firebase Auth
- [ ] Firestore sync
- [ ] Écrans secondaires
- [ ] Audio basique

**Phase 3 : Polish & UX**
- [ ] Animations
- [ ] Sound design
- [ ] Onboarding
- [ ] Settings

**Phase 4 : Advanced Features**
- [ ] Modes de jeu
- [ ] Défis quotidiens
- [ ] Achievements
- [ ] Leaderboard

**Phase 5 : Production Ready**
- [ ] Tests
- [ ] Optimisations
- [ ] Build final
- [ ] Store submission

### Testing Strategy

```bash
# Mode développement - Hot reload
npm start

# Test sur appareil physique
npm run android

# Test APK de développement
cd android
./gradlew assembleDebug
# APK dans: android/app/build/outputs/apk/debug/

# Test des règles Firestore
firebase emulators:start
```

---

## 📱 Build & Déploiement

### Mode Développement

```bash
# Lancer le serveur Expo
npm start

# Scanner QR code avec Expo Go (Android/iOS)
# OU

# Lancer directement sur Android
npm run android

# Lancer sur iOS (Mac uniquement)
npm run ios
```

### Build APK (Debug)

```bash
# Générer les fichiers natifs
npx expo prebuild --clean

# Build APK de debug
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk

# Installer sur appareil
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Build APK (Release)

**1. Générer une clé de signature**

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**2. Configurer `gradle.properties`**

```properties
# android/gradle.properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=***********
MYAPP_RELEASE_KEY_PASSWORD=***********
```

**3. Modifier `android/app/build.gradle`**

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**4. Build APK Release**

```bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### Build AAB (Android App Bundle)

**Pour Google Play Store**

```bash
cd android
./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

### EAS Build (Expo Application Services)

```bash
# Installer EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurer le projet
eas build:configure

# Build Android
eas build --platform android --profile production

# Build iOS (nécessite compte Apple Developer)
eas build --platform ios --profile production
```

---

## ⚠️ Anomalies Courantes & Solutions

### 1. **Problème : Sound Overlap (Chevauchement de sons)**

**Symptôme** : Plusieurs sons se jouent en même temps
```typescript
// ❌ MAUVAIS
const playSound = async () => {
  await sound.playAsync();
};
```

**Solution** :
```typescript
// ✅ BON
const playSound = async (soundKey: keyof SoundCache) => {
  if (!soundCache[soundKey]) return;
  
  const sound = soundCache[soundKey];
  const status = await sound.getStatusAsync();
  
  if (status.isLoaded && status.isPlaying) {
    await sound.stopAsync();
  }
  
  await sound.setPositionAsync(0);
  await sound.playAsync();
};
```

---

### 2. **Problème : Double Affichage Onboarding**

**Symptôme** : Onboarding s'affiche deux fois (après install + après connexion)

**Cause** : Race condition entre `AsyncStorage.setItem` et lecture

**Solution** :
```typescript
// État local pour tracker immédiatement
const [onboardingDone, setOnboardingDone] = useState(false);

const handleOnboardingComplete = async () => {
  await setOnboardingCompleted(); // AsyncStorage
  setOnboardingDone(true); // État local immédiat
};

// Vérifier l'état local ET AsyncStorage
if (!onboardingDone) {
  return <OnboardingScreen />;
}
```

---

### 3. **Problème : Modal sans Scroll**

**Symptôme** : ScrollView n'affiche pas tout le contenu

**Cause** : Propriété `gap` non supportée, manque de `flex: 1`

**Solution** :
```typescript
// ❌ MAUVAIS
<View style={{ gap: 16 }}>
  <ScrollView style={{ maxHeight: 400 }}>
    {items}
  </ScrollView>
</View>

// ✅ BON
<View style={{ flex: 1 }}>
  <ScrollView 
    style={{ flex: 1 }}
    contentContainerStyle={{ paddingBottom: 16 }}
  >
    {items.map((item, i) => (
      <View key={i} style={{ marginBottom: 16 }}>
        {item}
      </View>
    ))}
  </ScrollView>
</View>
```

---

### 4. **Problème : Chevauchement Modals**

**Symptôme** : Modal profil + écran chargement visible en même temps

**Solution** :
```typescript
// Conditions ternaires avec 3 états
{isLoading ? (
  <LoadingScreen />
) : showModal ? (
  <EmptyBackground />  // Fond vide pour le modal
) : (
  <MainContent />
)}

// Modal rendu séparément
<Modal visible={showModal}>
  <ProfileSetup />
</Modal>
```

---

### 5. **Problème : Firebase Auth Closure**

**Symptôme** : `onAuthStateChanged` garde l'ancienne valeur d'état

**Cause** : Closure dans un seul `useEffect`

**Solution** :
```typescript
// ❌ MAUVAIS - Un seul useEffect
useEffect(() => {
  const init = async () => {
    const onboarding = await hasCompletedOnboarding();
    
    firebase.onAuthStateChanged((user) => {
      // onboarding garde l'ancienne valeur !
      if (onboarding) { /* ... */ }
    });
  };
  init();
}, []);

// ✅ BON - Séparer les useEffect
useEffect(() => {
  // 1. Init audio + onboarding
  const init = async () => {
    const completed = await hasCompletedOnboarding();
    setOnboardingDone(completed);
  };
  init();
}, []);

useEffect(() => {
  // 2. Auth listener indépendant
  return firebase.onAuthStateChanged(setUser);
}, []);

useEffect(() => {
  // 3. Navigation réactive aux changements
  if (!onboardingDone) navigate('onboarding');
  else if (!user) navigate('login');
  else navigate('home');
}, [user, onboardingDone]);
```

---

### 6. **Problème : Gradle Build Fail**

**Symptômes divers** :
- `AAPT: error: resource android:attr/lStar not found`
- `Execution failed for task ':app:mergeDebugResources'`
- Cache corrompu

**Solutions** :

```bash
# 1. Nettoyer le cache Gradle
cd android
./gradlew clean

# 2. Supprimer les dossiers de build
rm -rf .gradle
rm -rf app/build
rm -rf build

# 3. Invalider les caches Android Studio
# File > Invalidate Caches / Restart

# 4. Reconstruire
./gradlew assembleDebug --stacktrace

# 5. Si problème persiste, réinstaller node_modules
cd ..
rm -rf node_modules
npm install
npx expo prebuild --clean
```

---

### 7. **Problème : Metro Bundler Port Occupé**

**Symptôme** : `Error: listen EADDRINUSE: address already in use :::8081`

**Solution** :
```bash
# Tuer le processus sur le port 8081
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8081 | xargs kill -9

# Ou utiliser un autre port
npx expo start --port 8082
```

---

### 8. **Problème : AsyncStorage Import Deprecated**

**Symptôme** : Warning sur `@react-native-community/async-storage`

**Solution** :
```bash
# Désinstaller l'ancien
npm uninstall @react-native-community/async-storage

# Installer le nouveau
npm install @react-native-async-storage/async-storage
```

```typescript
// Mise à jour des imports
import AsyncStorage from '@react-native-async-storage/async-storage';
```

---

### 9. **Problème : Firebase Firestore Offline**

**Symptôme** : Données non synchronisées, erreurs réseau

**Solution** :
```typescript
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);

// Activer la persistance
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});
```

---

### 10. **Problème : Expo Go vs Dev Build**

**Symptôme** : Certaines dépendances ne fonctionnent pas avec Expo Go

**Packages nécessitant un Dev Build** :
- `@react-native-firebase/*`
- `react-native-camera`
- Modules natifs personnalisés

**Solution** :
```bash
# Créer un dev build
npx expo prebuild
npm run android  # Build complet, pas Expo Go
```

---

## ✅ Best Practices

### 1. **TypeScript Strict Mode**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 2. **Error Boundaries**

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught:', error, info);
    // Log to Firebase Analytics ou Sentry
  }
  
  render() {
    return this.props.children;
  }
}
```

### 3. **Performance - Memoization**

```typescript
// Composants
const GameGrid = React.memo(({ cells }) => {
  // ...
});

// Callbacks
const handlePress = useCallback(() => {
  // ...
}, [dependencies]);

// Valeurs calculées
const sortedScores = useMemo(() => {
  return scores.sort((a, b) => b - a);
}, [scores]);
```

### 4. **Audio Preloading**

```typescript
// Précharger TOUS les sons au démarrage
const preloadSounds = async () => {
  const sounds = await Promise.all([
    Audio.Sound.createAsync(require('./sound1.mp3')),
    Audio.Sound.createAsync(require('./sound2.mp3')),
  ]);
  
  return sounds.map(s => s.sound);
};
```

### 5. **Firestore Batch Operations**

```typescript
// Éviter les multiples writes
const batch = writeBatch(db);

batch.set(userRef, userData);
batch.update(leaderboardRef, { score: newScore });
batch.delete(oldEntryRef);

await batch.commit();
```

### 6. **Async Storage Keys**

```typescript
// Centraliser les clés
const STORAGE_KEYS = {
  USER_PROGRESS: '@App:userProgress',
  SETTINGS: '@App:settings',
  ONBOARDING: '@App:onboardingDone',
} as const;
```

### 7. **Loading States**

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const data = await api.getData();
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

### 8. **Navigation avec Types**

```typescript
type Screen = 'home' | 'game' | 'profile' | 'settings';

const [currentScreen, setCurrentScreen] = useState<Screen>('home');

// Type-safe navigation
const navigate = (screen: Screen) => {
  setCurrentScreen(screen);
};
```

---

## 📋 Checklist de Projet

### Phase 1 : Setup Initial
- [ ] Créer projet Expo avec TypeScript
- [ ] Initialiser Git
- [ ] Configurer Firebase (Console + app)
- [ ] Installer toutes les dépendances
- [ ] Tester build dev sur appareil
- [ ] Configurer ESLint/Prettier (optionnel)

### Phase 2 : Architecture
- [ ] Créer structure de dossiers
- [ ] Définir types TypeScript
- [ ] Créer design tokens
- [ ] Implémenter services (Firebase, Storage)
- [ ] Créer hooks de base

### Phase 3 : Features Core
- [ ] Écran principal fonctionnel
- [ ] Logique métier principale
- [ ] Navigation entre écrans
- [ ] Sauvegarde locale (AsyncStorage)
- [ ] Synchronisation Firebase

### Phase 4 : UX/UI
- [ ] Onboarding
- [ ] Animations
- [ ] Audio (préchargement)
- [ ] Haptic feedback
- [ ] Loading states
- [ ] Error handling

### Phase 5 : Advanced Features
- [ ] Auth (Anonymous + Email)
- [ ] Profils utilisateurs
- [ ] Leaderboard
- [ ] Achievements
- [ ] Settings/Preferences

### Phase 6 : Polish
- [ ] Tester tous les flows
- [ ] Corriger les bugs
- [ ] Optimiser performances
- [ ] Ajouter analytics (optionnel)
- [ ] Tests utilisateurs

### Phase 7 : Build & Deploy
- [ ] Générer keystore
- [ ] Configurer signing
- [ ] Build APK release
- [ ] Build AAB pour Play Store
- [ ] Tester sur multiples appareils
- [ ] Préparer assets store (icônes, screenshots)
- [ ] Soumettre sur Google Play

---

## 🎯 Timeline Recommandé

**Petit Projet (2-4 semaines)**
- Semaine 1 : Setup + Architecture + Core
- Semaine 2 : Features + UI
- Semaine 3 : Polish + Tests
- Semaine 4 : Build + Deploy

**Projet Moyen (1-2 mois)**
- Semaines 1-2 : Setup + Architecture complète
- Semaines 3-4 : Features principales
- Semaines 5-6 : Features avancées
- Semaines 7-8 : Polish + Tests + Deploy

**Grand Projet (3+ mois)**
- Mois 1 : Architecture solide + MVP
- Mois 2 : Toutes les features
- Mois 3 : Polish + Tests + Optimisations + Deploy

---

## 📚 Ressources Utiles

### Documentation
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Outils
- [Expo Snack](https://snack.expo.dev/) - Playground en ligne
- [React Native Directory](https://reactnative.directory/) - Packages compatibles
- [Firebase Console](https://console.firebase.google.com/)
- [Android Studio](https://developer.android.com/studio)

### Debugging
- [Expo DevTools](https://docs.expo.dev/workflow/debugging/)
- [React DevTools](https://github.com/facebook/react-devtools)
- [Flipper](https://fbflipper.com/) - Debugger avancé

---

## 🚀 Quick Start Template

```bash
# 1. Créer le projet
npx create-expo-app@latest MonProjet --template expo-template-blank-typescript

# 2. Installer les dépendances essentielles
cd MonProjet
npm install @react-native-async-storage/async-storage
npm install firebase
npm install expo-av expo-haptics
npm install react-native-safe-area-context

# 3. Créer la structure
mkdir -p src/{components,screens,hooks,services,utils,constants,types}
mkdir -p assets/{images,Sound}

# 4. Initialiser Git
git init
echo "node_modules/" > .gitignore
echo ".expo/" >> .gitignore
echo "android/" >> .gitignore
echo "ios/" >> .gitignore

# 5. Premier commit
git add .
git commit -m "Initial project setup"

# 6. Lancer en dev
npm start
```

---

## 📝 Notes Finales

### Ce qui a bien fonctionné dans Memory Matrix

✅ **Séparation des préoccupations** - Services, Hooks, Components  
✅ **TypeScript strict** - Moins d'erreurs runtime  
✅ **Design tokens** - Cohérence visuelle facile  
✅ **Préchargement audio** - Pas de latence  
✅ **Multiple useEffect** - Éviter les closures  
✅ **AsyncStorage + État local** - Pas de race conditions  
✅ **Firestore batch operations** - Performance optimale  

### Points d'Amélioration Possibles

🔄 **Tests automatisés** - Jest + React Native Testing Library  
🔄 **CI/CD** - GitHub Actions pour builds automatiques  
🔄 **Analytics** - Firebase Analytics ou Sentry  
🔄 **Internationalisation** - i18n pour multi-langues  
🔄 **Accessibilité** - Labels et navigation clavier  

---

**Créé par : Assistant IA**  
**Basé sur : Memory Matrix Project**  
**Dernière mise à jour : Octobre 2025**  

---

*Ce guide est un document vivant. Mettez-le à jour au fur et à mesure de vos découvertes et améliorations !*
