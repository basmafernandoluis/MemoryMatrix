# 📲 Guide de Configuration des Push Notifications Firebase

Guide complet pour configurer Firebase Cloud Messaging (FCM) dans Memory Matrix.

---

## 📋 Table des matières

1. [Configuration Firebase Console](#1-configuration-firebase-console)
2. [Configuration Android](#2-configuration-android)
3. [Configuration iOS](#3-configuration-ios)
4. [Installation des dépendances](#4-installation-des-dépendances)
5. [Configuration app.json](#5-configuration-appjson)
6. [Déploiement Cloud Functions](#6-déploiement-cloud-functions)
7. [Tests des notifications](#7-tests-des-notifications)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Configuration Firebase Console

### Étape 1.1 : Activer Cloud Messaging

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet **memorymatrix-9781b**
3. Dans le menu latéral : **Développer** → **Cloud Messaging**
4. Cliquez sur **Commencer** si c'est la première fois

### Étape 1.2 : Configuration Android (déjà fait normalement)

Vérifiez que vous avez bien :
- ✅ Le fichier `google-services.json` dans `android/app/`
- ✅ L'app enregistrée avec le package name : `com.appwizards.MemoryMatrix`

### Étape 1.3 : Configuration iOS (si nécessaire)

Si vous voulez supporter iOS :

1. Dans Firebase Console → **Paramètres du projet** → **Cloud Messaging**
2. Onglet **iOS**
3. Téléversez votre **APNs Authentication Key** (nécessite un compte développeur Apple)

---

## 2. Configuration Android

### Étape 2.1 : Vérifier build.gradle (projet)

Fichier : `android/build.gradle`

```gradle
buildscript {
    dependencies {
        // Vérifier la version de google-services
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### Étape 2.2 : Vérifier build.gradle (app)

Fichier : `android/app/build.gradle`

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'  // ✅ Doit être à la fin

android {
    // ...
    defaultConfig {
        // ...
        multiDexEnabled true  // Important pour Firebase
    }
}

dependencies {
    // Firebase déjà inclus via React Native Firebase
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

### Étape 2.3 : AndroidManifest.xml

Fichier : `android/app/src/main/AndroidManifest.xml`

Ajoutez ces permissions si elles ne sont pas déjà présentes :

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissions pour les notifications -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application>
        <!-- ... -->
        
        <!-- Service de notifications Firebase -->
        <service
            android:name="com.google.firebase.messaging.FirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <!-- Icône de notification par défaut -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@mipmap/ic_launcher" />
        
        <!-- Couleur de notification par défaut -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/notification_color" />
            
        <!-- Canal de notification par défaut -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="memory_matrix_default" />
    </application>
</manifest>
```

### Étape 2.4 : Créer colors.xml

Fichier : `android/app/src/main/res/values/colors.xml` (créer si inexistant)

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="notification_color">#4F46E5</color>
</resources>
```

---

## 3. Configuration iOS (optionnel)

### Étape 3.1 : Capabilities

1. Ouvrez le projet dans Xcode
2. Sélectionnez la cible → **Signing & Capabilities**
3. Ajoutez **Push Notifications**
4. Ajoutez **Background Modes** → cochez **Remote notifications**

### Étape 3.2 : AppDelegate

Fichier : `ios/MemoryMatrix/AppDelegate.mm`

```objc
#import <Firebase.h>
#import <UserNotifications/UserNotifications.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  
  // Demander les permissions de notification
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  return YES;
}

// Gérer les notifications en foreground
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
  completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionSound);
}

@end
```

---

## 4. Installation des dépendances

### Étape 4.1 : Installer @react-native-firebase/messaging

```bash
npm install @react-native-firebase/messaging
```

### Étape 4.2 : Rebuild l'app

#### Android :
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
cd android
./gradlew assembleDebug
```

#### iOS :
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

---

## 5. Configuration app.json

Fichier : `app.json`

Ajoutez la configuration des notifications :

```json
{
  "expo": {
    "name": "Memory Matrix",
    "slug": "MemoryMatrix",
    "version": "1.4.0",
    "android": {
      "package": "com.appwizards.MemoryMatrix",
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "INTERNET",
        "POST_NOTIFICATIONS",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED"
      ],
      "notification": {
        "icon": "./assets/notification-icon.png",
        "color": "#4F46E5",
        "androidMode": "default",
        "androidCollapsedTitle": "Memory Matrix"
      }
    },
    "ios": {
      "bundleIdentifier": "com.appwizards.MemoryMatrix",
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#4F46E5",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

---

## 6. Déploiement Cloud Functions

### Étape 6.1 : Installer Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Étape 6.2 : Initialiser Functions

```bash
firebase init functions
```

Sélectionnez :
- **TypeScript**
- **ESLint** : Oui
- **Install dependencies** : Oui

### Étape 6.3 : Créer la Cloud Function

Fichier : `functions/src/index.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Envoyer une notification push quand une notification est créée
 */
export const sendPushNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    if (notification.sent) {
      return null; // Déjà envoyée
    }

    try {
      // Récupérer le token FCM du destinataire
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(notification.recipientId)
        .get();

      const userData = userDoc.data();
      if (!userData || !userData.fcmToken) {
        console.log('No FCM token for user:', notification.recipientId);
        return null;
      }

      // Préparer le message
      const message: admin.messaging.Message = {
        token: userData.fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          type: notification.type,
          senderId: notification.senderId,
          senderName: notification.senderName,
          challengeId: notification.challengeId || '',
          requestId: notification.requestId || '',
          score: notification.score?.toString() || '',
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'memory_matrix_default',
            sound: 'default',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Envoyer la notification
      await admin.messaging().send(message);
      
      // Marquer comme envoyée
      await snap.ref.update({ sent: true });

      console.log('Notification sent to:', notification.recipientId);
      return null;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });

/**
 * Nettoyer les anciennes notifications (tous les jours)
 */
export const cleanupOldNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await admin.firestore()
      .collection('notifications')
      .where('createdAt', '<', thirtyDaysAgo)
      .get();

    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} old notifications`);
    return null;
  });
```

### Étape 6.4 : Déployer les Functions

```bash
firebase deploy --only functions
```

**Note :** Les Cloud Functions nécessitent le plan **Blaze** (facturation activée) de Firebase.

---

## 7. Tests des notifications

### Test 1 : Vérifier le token FCM

Dans votre app, vérifiez les logs :
```
FCM Token registered: <long-token-string>
```

### Test 2 : Envoyer une notification test (Console Firebase)

1. Firebase Console → **Cloud Messaging**
2. Cliquez sur **Envoyer votre premier message**
3. Entrez :
   - **Titre** : "Test Memory Matrix"
   - **Texte** : "Notification de test"
4. Cliquez sur **Envoyer un message test**
5. Collez votre FCM token
6. Cliquez sur **Test**

### Test 3 : Tester avec l'app

1. **Créez un défi** avec un ami
2. Vérifiez que l'ami reçoit la notification "Nouveau défi"
3. **Acceptez le défi**
4. Vérifiez que le créateur reçoit "Défi accepté"
5. **Jouez et terminez**
6. Vérifiez les notifications de score et résultat

---

## 8. Troubleshooting

### ❌ "No FCM token registered"

**Solution :**
1. Vérifiez que `@react-native-firebase/messaging` est installé
2. Rebuild l'app : `npx expo prebuild --clean`
3. Vérifiez les permissions dans AndroidManifest.xml

### ❌ "Notification permission denied"

**Solution :**
1. Demandez manuellement les permissions :
   - Android 13+ : L'app doit demander `POST_NOTIFICATIONS`
   - iOS : L'utilisateur doit accepter dans les paramètres

2. Réinitialisez les permissions :
   ```bash
   # Android
   adb shell pm reset-permissions com.appwizards.MemoryMatrix
   ```

### ❌ "Cloud Function not triggered"

**Solution :**
1. Vérifiez que le plan Blaze est activé
2. Vérifiez les logs :
   ```bash
   firebase functions:log
   ```
3. Testez manuellement :
   ```bash
   firebase functions:shell
   ```

### ❌ "Token refresh failed"

**Solution :**
1. Vérifiez que `google-services.json` est à jour
2. Re-téléchargez depuis Firebase Console
3. Rebuild l'app

### ❌ Notifications reçues mais pas affichées

**Solution Android :**
1. Créez un canal de notification :
   ```java
   // Dans MainActivity.java
   NotificationChannel channel = new NotificationChannel(
       "memory_matrix_default",
       "Memory Matrix",
       NotificationManager.IMPORTANCE_HIGH
   );
   ```

**Solution iOS :**
1. Vérifiez que les capabilities Push Notifications sont activées
2. Vérifiez le certificat APNs dans Firebase

---

## 📊 Monitoring

### Firebase Console

Surveillez les statistiques :
- **Cloud Messaging** → **Rapports** : Taux de livraison
- **Functions** → **Logs** : Erreurs d'exécution
- **Firestore** → **Usage** : Collection `notifications`

### Logs de l'app

Ajoutez des logs dans `notificationService.ts` :
```typescript
console.log('Notification sent:', { recipientId, type });
```

---

## ✅ Checklist finale

- [ ] Firebase Cloud Messaging activé
- [ ] `@react-native-firebase/messaging` installé
- [ ] `google-services.json` à jour
- [ ] AndroidManifest.xml configuré
- [ ] app.json configuré
- [ ] Cloud Functions déployées
- [ ] Permissions demandées au démarrage
- [ ] Token FCM sauvegardé dans Firestore
- [ ] Notifications testées (défi, ami)
- [ ] Notifications en foreground fonctionnent
- [ ] Notifications en background fonctionnent
- [ ] Navigation depuis notification fonctionne

---

## 🚀 Prochaines étapes

Une fois les notifications configurées :

1. **Personnaliser les sons** : Ajoutez des sons personnalisés
2. **Badges d'app** : Afficher le nombre de notifications non lues
3. **Actions rapides** : Boutons dans les notifications
4. **Groupement** : Regrouper les notifications par type
5. **Analytics** : Tracker l'engagement des notifications

---

## 📚 Ressources

- [React Native Firebase Docs](https://rnfirebase.io/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Android Notifications](https://developer.android.com/develop/ui/views/notifications)
- [iOS Push Notifications](https://developer.apple.com/documentation/usernotifications)

---

**Dernière mise à jour :** 3 novembre 2025
**Version de l'app :** 1.4.0
**Contact support :** AppWizards Team
