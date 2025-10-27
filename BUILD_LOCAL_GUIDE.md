# 🚀 Guide de Build Local - Memory Matrix

## 📋 Prérequis Vérifiés

Avant de commencer, assurez-vous d'avoir :
- ✅ Node.js installé
- ✅ Expo CLI installé (`npm install -g expo-cli`)
- ✅ Images dans `assets/` (icon.png, adaptive-icon.png, splash.png, favicon.png)
- ✅ Téléphone Android ou Emulateur Android Studio

---

## 🎯 Option 1 : Build APK de Développement (RECOMMANDÉ)

Cette méthode crée un APK que vous pouvez installer directement sur votre téléphone.

### Étape 1 : Nettoyer le Cache

```powershell
# Nettoyer le cache Expo
npx expo start --clear

# Ou nettoyer complètement
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules\.cache
```

### Étape 2 : Build de Développement Local

```powershell
# Créer un build de développement Android
npx expo run:android
```

**Ce que cela fait :**
- ✅ Génère automatiquement les icônes de toutes tailles
- ✅ Compile l'application Android
- ✅ Installe l'APK sur votre appareil/émulateur connecté
- ✅ Lance l'application automatiquement

### Étape 3 : Connecter Votre Téléphone

**Via USB :**
```powershell
# Vérifier que votre téléphone est détecté
adb devices

# Devrait afficher quelque chose comme :
# List of devices attached
# ABC123456789    device
```

**Activer le Mode Développeur sur Android :**
1. Paramètres → À propos du téléphone
2. Taper 7 fois sur "Numéro de build"
3. Retour → Options de développeur
4. Activer "Débogage USB"
5. Connecter le téléphone via USB
6. Autoriser le débogage sur le téléphone

---

## 🎯 Option 2 : Expo Go (Test Rapide)

Pour un test rapide sans build :

### Étape 1 : Installer Expo Go

Sur votre téléphone Android :
- Téléchargez "Expo Go" depuis Google Play Store

### Étape 2 : Démarrer le Serveur

```powershell
# Démarrer Expo avec les nouvelles icônes
npx expo start --clear
```

### Étape 3 : Scanner le QR Code

- Scanner le QR code dans le terminal avec l'app Expo Go
- L'application se charge avec vos nouvelles icônes !

**⚠️ Note :** Avec Expo Go, vous ne verrez pas l'icône finale de l'app, mais seulement dans Expo Go.

---

## 🎯 Option 3 : Build APK Standalone (Production-like)

Pour créer un vrai APK installable :

### Prérequis

```powershell
# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login
```

### Configuration EAS Build

Créez le fichier `eas.json` :

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
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
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Build APK

```powershell
# Build APK de preview (recommandé pour tests)
eas build --platform android --profile preview

# Suivez les instructions à l'écran
# L'APK sera téléchargeable depuis le lien fourni
```

**Durée :** 5-15 minutes (build dans le cloud)

---

## 📱 Tester l'Application Locale (MÉTHODE RAPIDE)

### Solution Immédiate : Expo Dev Client

```powershell
# 1. Installer le dev client sur votre téléphone
npx expo install expo-dev-client

# 2. Build le dev client (une seule fois)
npx expo run:android

# 3. Ensuite, pour tous les tests suivants
npx expo start --dev-client
```

**Avantages :**
- ✅ Voir les vraies icônes
- ✅ Tester Firebase
- ✅ Reload rapide
- ✅ Pas besoin de rebuild à chaque fois

---

## 🔧 Résolution de Problèmes

### Erreur : "Android SDK not found"

```powershell
# Installer Android Studio
# Puis configurer les variables d'environnement :
$env:ANDROID_HOME = "C:\Users\VotreNom\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

### Erreur : "adb: command not found"

```powershell
# Ajouter ADB au PATH
$env:PATH += ";C:\Users\VotreNom\AppData\Local\Android\Sdk\platform-tools"
```

### Erreur : "No devices found"

```powershell
# Redémarrer le serveur ADB
adb kill-server
adb start-server
adb devices
```

### L'icône ne change pas

```powershell
# Nettoyer complètement
npx expo start --clear

# Ou désinstaller et réinstaller l'app
adb uninstall com.appwizards.MemoryMatrix
npx expo run:android
```

---

## 📋 Checklist Avant de Builder

- [ ] Les 4 images sont dans `assets/` (icon, adaptive-icon, splash, favicon)
- [ ] `app.json` est configuré correctement
- [ ] Firebase `google-services.json` est présent
- [ ] Téléphone en mode développeur avec USB debugging activé
- [ ] Téléphone connecté et détecté par `adb devices`

---

## 🎯 MÉTHODE RECOMMANDÉE POUR VOUS

Basé sur votre setup, je recommande :

### 1️⃣ Build de Développement Local (Plus Rapide)

```powershell
# Étape 1 : Nettoyer
npx expo start --clear
# Appuyez sur Ctrl+C pour arrêter

# Étape 2 : Builder et installer
npx expo run:android

# Attendez que l'app se lance sur votre téléphone
```

**Temps :** 3-5 minutes pour le premier build

### 2️⃣ Tester les Changements

Après le premier build, pour tester des modifications :

```powershell
# Relancer juste le serveur
npx expo start

# Les changements se rechargeront automatiquement !
```

---

## 📊 Comparaison des Méthodes

| Méthode | Temps | Icônes | Firebase | Recommandé |
|---------|-------|--------|----------|------------|
| Expo Go | 30s | ❌ Non | ⚠️ Limité | Test rapide UI |
| expo run:android | 3-5min | ✅ Oui | ✅ Oui | **OUI - DEV** |
| EAS Build | 10-15min | ✅ Oui | ✅ Oui | Production |

---

## 🚀 Commandes Rapides

### Lancement Quotidien
```powershell
# Si l'app est déjà installée sur le téléphone
npx expo start
```

### Rebuild Complet
```powershell
# Si vous changez les icônes ou la config
npx expo run:android --clear
```

### Build APK Partageable
```powershell
# Pour partager avec d'autres
eas build --platform android --profile preview
```

---

## 📝 Prochaines Étapes

Après le build :

1. **Tester l'icône** - Vérifier sur l'écran d'accueil Android
2. **Tester le splash screen** - Au lancement de l'app
3. **Tester les défis quotidiens** - Vérifier que tout fonctionne
4. **Déployer les règles Firestore** - Si ce n'est pas déjà fait

---

## 💡 Conseil Pro

Pour un workflow optimal :

```powershell
# Terminal 1 : Serveur Expo (toujours actif)
npx expo start

# Terminal 2 : Commandes ponctuelles
# - Rebuild : npx expo run:android
# - Logs : adb logcat *:S ReactNative:V ReactNativeJS:V
# - Clean : npx expo start --clear
```

---

**Vous êtes prêt ! Lancez simplement :**
```powershell
npx expo run:android
```

Et votre app Memory Matrix avec les nouvelles icônes sera installée sur votre téléphone ! 🎉
