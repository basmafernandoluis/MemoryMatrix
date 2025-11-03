# Corrections des Notifications Push

## Problèmes identifiés

1. **Erreur de permission Firestore** : `[firestore/permission-denied]`
2. **Notifications en arrière-plan** : Ne fonctionnent que sur un appareil

## Corrections appliquées

### 1. Service de notifications (notificationService.ts)
- ✅ Ajout de logging détaillé pour déboguer l'erreur de permission
- ✅ Extraction explicite du `senderId` au niveau racine du document pour respecter les règles Firestore

### 2. Handler de notifications en arrière-plan (index.ts)
- ✅ Ajout de `setBackgroundMessageHandler` pour gérer les notifications quand l'app est en arrière-plan/fermée

### 3. Configuration Android (app.json)
- ✅ Ajout du plugin `@react-native-firebase/messaging` avec permissions automatiques

### 4. AndroidManifest.xml
- ✅ Ajout des permissions nécessaires :
  - `POST_NOTIFICATIONS` (Android 13+)
  - `WAKE_LOCK` (réveil de l'appareil)
  - `RECEIVE` (réception des messages C2DM)
- ✅ Configuration des métadonnées Firebase :
  - Icône de notification par défaut
  - Couleur de notification par défaut
  - Canal de notification par défaut

### 5. Fichier de ressources (colors.xml)
- ✅ Ajout de `colorAccent` pour les notifications

## Étapes de déploiement

### 1. Rebuild Android (OBLIGATOIRE)
Les changements dans `AndroidManifest.xml`, `app.json`, et `index.ts` nécessitent un rebuild complet :

```powershell
# Option A : Rebuild avec Expo (recommandé)
npx expo prebuild --clean
cd android
./gradlew assembleDebug

# Option B : Si problème réseau persiste, nettoyer puis rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

### 2. Installer l'APK sur les deux appareils
```powershell
# L'APK se trouve dans :
# android/app/build/outputs/apk/debug/app-debug.apk

# Installer via ADB ou copier manuellement
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Tester les notifications

**Test 1 : Vérifier l'enregistrement FCM**
1. Ouvrir l'app sur chaque appareil
2. Chercher dans les logs : `"FCM Token registered: ..."`
3. Vérifier dans Firebase Console → Firestore → Collection `users`
4. Confirmer que les champs existent :
   - `fcmToken` (string)
   - `fcmTokenUpdatedAt` (timestamp)
   - `platform` (string: "android" ou "ios")

**Test 2 : Notifications en foreground (app ouverte)**
1. App ouverte sur appareil A
2. Envoyer défi depuis appareil B
3. Appareil A devrait afficher une Alert avec le message

**Test 3 : Notifications en background (app en arrière-plan)**
1. App en arrière-plan sur appareil A
2. Envoyer défi depuis appareil B
3. Appareil A devrait afficher une notification système

**Test 4 : Notifications quit state (app fermée)**
1. App complètement fermée sur appareil A
2. Envoyer défi depuis appareil B
3. Appareil A devrait afficher une notification système

## Diagnostic de l'erreur de permission

Si l'erreur persiste après rebuild, vérifier :

### Dans les logs de l'app
```javascript
// Rechercher ces messages :
Creating notification: { recipientId: '...', senderId: '...', type: '...' }
Notification created successfully

// Ou l'erreur :
Error creating notification: [firestore/permission-denied]
Notification data: { recipientId: '...', senderId: '...', type: '...' }
```

### Vérifier que senderId === auth.uid
L'erreur se produit si :
- `senderId` dans la notification ≠ `request.auth.uid` de l'utilisateur qui crée la notification
- L'utilisateur n'est pas authentifié

**Solution** :
- Vérifier que l'utilisateur est bien connecté
- Vérifier que le bon `userId` est passé lors de la création de la notification

### Vérifier les règles Firestore
```bash
firebase deploy --only firestore:rules
```

Règle attendue dans `firestore.rules` :
```javascript
match /notifications/{notificationId} {
  allow create: if isSignedIn() && request.resource.data.senderId == request.auth.uid;
}
```

## Vérification des logs Cloud Functions

```powershell
# Voir tous les logs
firebase functions:log

# Voir logs d'une fonction spécifique
firebase functions:log --only sendPushNotification
```

**Messages attendus après correction** :
- ✅ `Function execution started`
- ✅ `Sending notification to user: ...`
- ✅ `Notification sent successfully: ...`
- ✅ `Function execution took X ms, finished with status: 'ok'`

**Messages indiquant un problème** :
- ❌ `No FCM token for user: ...` → Token non enregistré
- ❌ `Error sending notification: ...` → Problème FCM

## Différence entre les deux appareils

### Appareil qui reçoit les notifications en arrière-plan
- ✅ Build récent avec les configurations Android correctes
- ✅ Google Play Services à jour
- ✅ Permissions de notification activées dans les paramètres
- ✅ Économie d'énergie désactivée pour l'app

### Appareil qui ne reçoit qu'en foreground
- ❌ Build ancien sans `setBackgroundMessageHandler`
- ❌ Ou Google Play Services obsolète
- ❌ Ou permissions bloquées
- ❌ Ou mode économie d'énergie actif

**Solution** : Rebuild et réinstaller l'APK sur les deux appareils

## Checklist finale

Avant de considérer que les notifications fonctionnent :

- [ ] Rebuild Android effectué
- [ ] APK installé sur les deux appareils
- [ ] Les deux appareils affichent "FCM Token registered" dans les logs
- [ ] Les deux tokens sont visibles dans Firestore collection `users`
- [ ] Aucune erreur `permission-denied` dans les logs de l'app
- [ ] Cloud Functions logs montrent "Notification sent successfully"
- [ ] Notifications reçues en foreground (app ouverte)
- [ ] Notifications reçues en background (app en arrière-plan)
- [ ] Notifications reçues en quit state (app fermée)
- [ ] Cliquer sur notification ouvre l'app

## Notes importantes

1. **Android 13+** : L'utilisateur doit explicitement accorder la permission POST_NOTIFICATIONS
2. **Google Play Services** : Obligatoire pour FCM sur Android
3. **Rebuild obligatoire** : Les changements dans AndroidManifest nécessitent un rebuild natif
4. **Cache** : Parfois nécessaire de nettoyer : `./gradlew clean`
5. **Délai** : Les notifications peuvent prendre 1-3 secondes à arriver
