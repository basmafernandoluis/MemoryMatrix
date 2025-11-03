# Guide de Build Android - Notifications Push

## Modifications effectuées

### Fichiers modifiés
1. ✅ `index.ts` - Background message handler
2. ✅ `app.json` - Plugin FCM
3. ✅ `android/app/src/main/AndroidManifest.xml` - Permissions et métadonnées
4. ✅ `android/app/src/main/res/values/colors.xml` - Couleur accent
5. ✅ `src/services/notificationService.ts` - Navigation callback
6. ✅ `App.tsx` - Gestion navigation notifications
7. ✅ `src/screens/FriendChallengesScreen.tsx` - Onglets dynamiques et mise en évidence

### Nouveautés
- ✨ Notifications en arrière-plan et app fermée
- ✨ Navigation automatique vers l'écran approprié
- ✨ Mise en évidence visuelle des défis provenant de notifications
- ✨ Badge "🔔 Nouveau" sur les éléments notifiés

## Commandes de build

### Option 1 : Build avec prebuild (recommandé)
```powershell
# Nettoyer et rebuild
npx expo prebuild --clean
cd android
./gradlew assembleDebug
```

### Option 2 : Build direct si prebuild échoue
```powershell
cd android
./gradlew clean
./gradlew assembleDebug
```

### Option 3 : Build sans clean (si pas de changements natifs)
```powershell
cd android
./gradlew assembleDebug
```

## Localisation de l'APK

Une fois le build réussi :
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Installation sur les appareils

### Via ADB (recommandé)
```powershell
# Installer sur l'appareil connecté
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Si l'app existe déjà, forcer la réinstallation
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Manuellement
1. Copier `app-debug.apk` sur chaque appareil
2. Ouvrir le fichier depuis l'explorateur de fichiers
3. Autoriser l'installation depuis sources inconnues si demandé
4. Installer

## Vérification post-installation

### 1. Permissions
Vérifier dans Paramètres → Applications → MemoryMatrix → Autorisations :
- ✅ Notifications activées

Pour Android 13+ :
- La permission sera demandée automatiquement au premier lancement
- Si refusée, aller manuellement dans les paramètres

### 2. Logs de démarrage
Après installation, connecter via ADB et vérifier :
```powershell
adb logcat | Select-String "FCM"
```

Chercher :
```
FCM Token registered: <token>
```

### 3. Firestore
Vérifier dans Firebase Console → Firestore → Collection `users` :
- Le document de l'utilisateur doit avoir :
  - `fcmToken` (string)
  - `fcmTokenUpdatedAt` (timestamp)
  - `platform` (string: "android")

## Troubleshooting

### Build échoue avec erreur réseau
```
Could not resolve all dependencies
```
**Solution** : Vérifier la connexion Internet, utiliser un VPN si nécessaire

### Erreur "Failed to install"
```powershell
# Désinstaller l'ancienne version manuellement
adb uninstall com.appwizards.MemoryMatrix
# Puis réinstaller
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Notifications ne s'affichent pas en arrière-plan
1. Vérifier Google Play Services à jour
2. Vérifier économie d'énergie désactivée pour l'app
3. Vérifier permissions notifications dans les paramètres
4. Redémarrer l'appareil

### Token FCM non enregistré
1. Vérifier les logs : `FCM Token registered:`
2. Si absent, vérifier permission notifications
3. Forcer fermeture app et réouvrir
4. Vérifier connexion Internet

### Navigation ne fonctionne pas
1. Vérifier que le build inclut les derniers changements
2. Vérifier les logs : `Notification navigation: { screen: '...', params: {...} }`
3. Tester d'abord en foreground (plus facile à déboguer)

## Checklist de test complet

Après installation sur les deux appareils :

- [ ] **Appareil 1** : Ouvrir l'app, vérifier "FCM Token registered" dans logs
- [ ] **Appareil 2** : Ouvrir l'app, vérifier "FCM Token registered" dans logs
- [ ] **Firebase Console** : Vérifier tokens dans Firestore `users` collection
- [ ] **Appareil 1** : Envoyer demande d'ami à Appareil 2
- [ ] **Appareil 2** : Recevoir notification (app en background)
- [ ] **Appareil 2** : Cliquer notification → Navigation vers Friends > Requests ✅
- [ ] **Appareil 2** : Accepter demande
- [ ] **Appareil 1** : Recevoir notification acceptation
- [ ] **Appareil 1** : Créer défi contre Appareil 2
- [ ] **Appareil 2** : Recevoir notification défi (app fermée)
- [ ] **Appareil 2** : Cliquer notification → Navigation vers Challenges > Pending ✅
- [ ] **Appareil 2** : Défi surligné en bleu avec badge "🔔 Nouveau" ✅
- [ ] **Appareil 2** : Accepter défi
- [ ] **Appareil 1** : Recevoir notification acceptation
- [ ] **Appareil 1** : Jouer partie et soumettre score
- [ ] **Appareil 2** : Recevoir notification score soumis
- [ ] **Appareil 2** : Cliquer notification → Navigation vers Challenges > Active ✅
- [ ] **Appareil 2** : Jouer partie
- [ ] **Les deux** : Recevoir notifications de fin de défi
- [ ] **Cliquer notifications** : Navigation vers Challenges > History ✅

## Notes importantes

- **Rebuild obligatoire** : Les changements natifs (AndroidManifest, app.json) ne sont pas hot-reloadables
- **Les deux appareils** : Doivent avoir la nouvelle version pour tester pleinement
- **Google Play Services** : Obligatoire sur les deux appareils
- **Internet** : Nécessaire pour FCM et Firestore
- **Logs Cloud Functions** : `firebase functions:log --only sendPushNotification` pour déboguer côté serveur
