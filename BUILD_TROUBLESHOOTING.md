# 🔧 Guide de Dépannage - Build Android

## ❌ Erreur Rencontrée : CMake Build Failed

### Problème
```
CMake Error: add_subdirectory given source
"C:/MemoryMatrix/node_modules/@react-native-async-storage/async-storage/android/build/generated/source/codegen/jni/"
which is not an existing directory.
```

### Cause
Cette erreur se produit lorsque :
- Les fichiers de build CMake sont corrompus ou incomplets
- Le dossier `.cxx` contient des références invalides
- La génération de code natif n'a pas terminé correctement

---

## ✅ Solutions (Dans l'ordre)

### Solution 1 : Build Direct (EN COURS)
```powershell
cd android
.\gradlew clean assembleDebug
```

**Avantages :**
- Plus rapide
- Évite les problèmes de verrouillage de fichiers
- Build directement sans clean complet

**Status :** ✅ En cours d'exécution

---

### Solution 2 : Nettoyage Manuel
Si le build échoue encore :

```powershell
# Arrêter tous les processus liés
# Fermer Android Studio si ouvert
# Fermer tous les terminaux Expo

# Nettoyer les caches
Remove-Item -Recurse -Force android\.gradle -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\.cxx -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Rebuild
cd android
.\gradlew clean
.\gradlew assembleDebug
```

---

### Solution 3 : Prebuild Complet
Si toujours bloqué :

```powershell
# Supprimer le dossier Android (fermez VS Code d'abord)
Remove-Item -Recurse -Force android

# Régénérer
npx expo prebuild

# Builder
npx expo run:android
```

---

### Solution 4 : Reset Total
En dernier recours :

```powershell
# Nettoyer node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force android

# Réinstaller
npm install

# Régénérer
npx expo prebuild

# Builder
npx expo run:android
```

---

## 🎯 Solution Rapide (Recommandée)

Utilisez le script automatisé :

```powershell
.\build-local.ps1
# Choisir option 2 (Build Clean)
```

Ou directement :

```powershell
# Nettoyer et builder
cd android
.\gradlew clean
.\gradlew assembleDebug

# Installer l'APK
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

---

## 📊 Comprendre le Build Gradle

### Phases du Build
1. **Configuration** (10-30s)
   - Lecture des dépendances
   - Configuration des modules
   - Préparation de CMake

2. **Compilation** (2-5 min)
   - Compilation Java/Kotlin
   - Compilation C++ (React Native)
   - Génération de code

3. **Packaging** (30s)
   - Création de l'APK
   - Signature debug
   - Optimisation

### Progression Typique
```
<=============> 10% CONFIGURING
<=============> 30% COMPILING
<=============> 60% LINKING
<=============> 90% PACKAGING
<=============> 100% BUILD SUCCESSFUL
```

---

## ⚠️ Erreurs Communes

### 1. "EBUSY: resource busy or locked"
**Cause :** Fichier utilisé par un autre processus

**Solution :**
```powershell
# Fermer tous les terminaux
# Fermer VS Code
# Fermer Android Studio
# Attendre 10 secondes
# Réessayer
```

### 2. "SDK location not found"
**Cause :** Android SDK non configuré

**Solution :**
```powershell
# Créer android/local.properties
@"
sdk.dir=C:\\Users\\VotreNom\\AppData\\Local\\Android\\Sdk
"@ | Out-File -FilePath android\local.properties
```

### 3. "Gradle daemon failed"
**Cause :** Daemon Gradle bloqué

**Solution :**
```powershell
cd android
.\gradlew --stop
.\gradlew clean
```

### 4. "Out of memory"
**Cause :** Pas assez de RAM pour Gradle

**Solution :**
```powershell
# Dans android/gradle.properties
# Ajouter :
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

---

## 🚀 Après le Build Réussi

Une fois le build terminé, vous verrez :

```
BUILD SUCCESSFUL in 3m 45s
```

L'APK sera dans :
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### Installer l'APK

```powershell
# Vérifier appareil connecté
adb devices

# Installer
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

# Lancer l'app
adb shell am start -n com.appwizards.MemoryMatrix/.MainActivity
```

---

## 📱 Méthode Alternative : Expo Development Build

Si Gradle continue à poser problème :

```powershell
# Méthode plus stable
npx expo install expo-dev-client

# Builder via Expo (plus lent mais plus fiable)
npx expo run:android --device
```

---

## 💡 Optimisations

### Accélérer les Builds Futurs

```powershell
# Dans android/gradle.properties
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.caching=true
```

### Utiliser le Build Cache

```powershell
# Premier build
cd android
.\gradlew assembleDebug

# Builds suivants (plus rapides)
.\gradlew assembleDebug --build-cache
```

---

## 🔍 Diagnostics

### Vérifier l'état du build

```powershell
# Voir les tâches disponibles
cd android
.\gradlew tasks

# Build avec logs détaillés
.\gradlew assembleDebug --info

# Build avec debug complet
.\gradlew assembleDebug --debug > build.log
```

### Vérifier les dépendances

```powershell
# Lister les dépendances
.\gradlew :app:dependencies

# Vérifier les conflits
.\gradlew :app:dependencyInsight --dependency react-native
```

---

## ✅ Checklist de Dépannage

Avant de demander de l'aide :

- [ ] Tous les terminaux fermés (sauf celui du build)
- [ ] VS Code/Android Studio fermés
- [ ] Fichiers `.cxx` et `build` supprimés
- [ ] `gradlew --stop` exécuté
- [ ] Tentative de `.\gradlew clean assembleDebug`
- [ ] Logs complets sauvegardés avec `--info`
- [ ] ADB devices montre l'appareil
- [ ] Espace disque suffisant (>5GB)
- [ ] RAM disponible (>4GB)

---

## 📞 Status Actuel

✅ **Build en cours** avec la commande :
```powershell
cd android
.\gradlew clean assembleDebug
```

**Surveillez le terminal pour voir la progression !**

Temps estimé : 3-5 minutes

---

*Ce guide sera mis à jour selon le résultat du build en cours.*
