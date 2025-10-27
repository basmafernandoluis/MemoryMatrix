# 🚀 Guide de Build - Memory Matrix

## 📱 Build APK de Développement pour Android

### Option 1 : Build Local avec Expo (RECOMMANDÉ pour Test Rapide)

#### Étape 1 : Préparation
```powershell
# Assurez-vous d'être dans le bon dossier
cd c:\MemoryMatrix

# Nettoyez le cache
npx expo start --clear
```

#### Étape 2 : Build APK Local
```powershell
# Build en mode développement (plus rapide)
npx expo run:android

# OU si vous voulez un APK à installer manuellement
npx eas build --platform android --profile preview --local
```

### Option 2 : Build avec EAS (Expo Application Services)

#### Étape 1 : Installation d'EAS CLI
```powershell
# Installer EAS CLI globalement
npm install -g eas-cli

# Se connecter à votre compte Expo
eas login
```

#### Étape 2 : Initialiser EAS
```powershell
# Initialiser la configuration EAS
eas build:configure
```

Cela va créer un fichier `eas.json` avec cette configuration :

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

#### Étape 3 : Lancer le Build
```powershell
# Build de développement (pour tester)
eas build --platform android --profile preview

# OU build de production
eas build --platform android --profile production
```

### Option 3 : Build Rapide pour Test (Sans EAS)

#### Utiliser Expo Go (Le plus rapide)
```powershell
# Démarrer le serveur de développement
npm start

# Scanner le QR code avec l'app Expo Go
# Téléchargeable sur Google Play Store
```

⚠️ **Note** : Expo Go ne supporte PAS Firebase natif, donc cette option ne fonctionnera pas pour Memory Matrix qui utilise `@react-native-firebase`.

---

## 🔧 Build Recommandé : APK de Développement

### Méthode Complète Étape par Étape

#### 1. Vérifier les Prérequis
```powershell
# Vérifier Node.js
node --version  # Devrait être >= 18

# Vérifier npm
npm --version

# Vérifier Java (requis pour Android)
java -version  # Devrait être JDK 17 ou 11
```

#### 2. Créer le fichier eas.json
Créez manuellement `c:\MemoryMatrix\eas.json` :

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### 3. Build Local (Sans Cloud)
```powershell
# Build APK en local (plus rapide, gratuit)
npx eas build --platform android --profile preview --local

# OU si vous avez Android Studio installé
npx expo run:android --variant release
```

#### 4. Build Cloud (Avec EAS - nécessite compte Expo)
```powershell
# Se connecter
eas login

# Configurer le projet
eas build:configure

# Lancer le build
eas build --platform android --profile preview

# Attendre le build (5-15 minutes)
# Vous recevrez un lien pour télécharger l'APK
```

---

## 📥 Installation de l'APK sur Android

### Méthode 1 : Via USB (ADB)
```powershell
# Activer le débogage USB sur votre téléphone
# Paramètres → À propos → Appuyer 7x sur "Numéro de build"
# Paramètres → Options pour développeurs → Débogage USB

# Connecter le téléphone via USB
adb devices

# Installer l'APK
adb install chemin\vers\votre\app.apk
```

### Méthode 2 : Téléchargement Direct
1. Le build EAS vous donne un lien de téléchargement
2. Ouvrez le lien sur votre téléphone Android
3. Téléchargez l'APK
4. Autorisez l'installation de sources inconnues
5. Installez l'APK

### Méthode 3 : Partage de Fichier
1. Copiez l'APK sur votre téléphone (USB, Google Drive, etc.)
2. Ouvrez le fichier avec un gestionnaire de fichiers
3. Installez

---

## 🎯 Commandes Rapides

### Build le Plus Rapide (Development)
```powershell
# Avec expo run (si Android SDK installé)
npx expo run:android
```

### Build APK Partageable
```powershell
# Build cloud EAS (recommandé)
eas build -p android --profile preview

# OU build local
npx eas build -p android --profile preview --local
```

### Tester sans Build
```powershell
# Mode développement avec Hot Reload
npm start
# Puis scanner le QR avec Expo Go (ne marchera pas avec Firebase natif)
```

---

## 🐛 Dépannage

### Erreur : "eas: command not found"
```powershell
npm install -g eas-cli
```

### Erreur : "No Android SDK found"
Vous avez deux options :
1. **Installer Android Studio** (recommandé)
   - Télécharger depuis https://developer.android.com/studio
   - Installer Android SDK

2. **Utiliser EAS Build Cloud** (sans installer SDK)
   ```powershell
   eas build -p android --profile preview
   ```

### Erreur : Build Cloud nécessite un compte payant
Pour éviter les frais :
```powershell
# Build en local (gratuit)
npx eas build --platform android --profile preview --local
```

### L'APK ne s'installe pas
- Vérifiez que "Sources inconnues" est activé
- Essayez de désinstaller l'ancienne version
- Vérifiez l'espace de stockage

---

## ✅ Checklist Avant Build

- [ ] `google-services.json` présent dans le projet
- [ ] Règles Firestore déployées
- [ ] Images des assets présentes (icon.png, splash.png, etc.)
- [ ] `npm install` exécuté
- [ ] Pas d'erreurs TypeScript : `npm run tsc`
- [ ] Configuration Firebase correcte

---

## 🎉 Après le Build

Une fois l'APK installé :

1. **Première ouverture**
   - Acceptez les permissions
   - Passez l'onboarding
   - Connectez-vous (mode invité ou email)

2. **Testez les fonctionnalités**
   - ✅ Jouer une partie
   - ✅ Voir le classement
   - ✅ Accéder aux défis quotidiens
   - ✅ Modifier le profil
   - ✅ Vérifier que Firebase fonctionne

3. **Vérifiez les icônes**
   - Icône dans le launcher Android
   - Splash screen au démarrage
   - Icône adaptative (Android)

---

## 📝 Notes Importantes

### Build Development vs Production

**Development** :
- Plus rapide à builder
- Fichier APK plus gros
- Logs et débogage activés
- Hot reload possible

**Production** :
- Optimisé et minifié
- Fichier plus petit
- Pas de logs
- Meilleure performance

### Première Fois
Pour votre premier build, je recommande :
```powershell
eas build -p android --profile preview
```

C'est le plus simple et ne nécessite pas d'installer Android Studio.

---

## 🚀 Commande Finale Recommandée

```powershell
# 1. Nettoyer
npm install
npx expo start --clear

# 2. Vérifier qu'il n'y a pas d'erreurs
# Tester en mode dev d'abord

# 3. Builder l'APK
eas build -p android --profile preview

# 4. Attendre le lien de téléchargement (5-15 min)
# 5. Télécharger et installer sur votre téléphone
```

Bonne chance avec votre build ! 🎮✨
