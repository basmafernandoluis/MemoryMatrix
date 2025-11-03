# 🎯 Commandes d'Activation des Notifications

Copiez-collez ces commandes dans l'ordre.

---

## 📦 ÉTAPE 1 : Installation

```bash
# Dans le dossier racine du projet
cd..
```

**Note :** Version 23.4.1 pour compatibilité avec `@react-native-firebase/app@23.4.1`

**Temps estimé :** 1 minute

---

## 🔨 ÉTAPE 2 : Rebuild l'application

```bash
# Nettoyer et rebuild Android
npx expo prebuild --clean

cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
cd ..
```

**Temps estimé :** 3-5 minutes

---

## 🔥 ÉTAPE 3 : Initialiser Firebase Functions

```bash
# Installer Firebase CLI (si pas déjà fait)
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser Functions
firebase init functions
```

**Répondre aux questions :**
- ✅ TypeScript
- ✅ ESLint
- ✅ Install dependencies now

**Temps estimé :** 2 minutes

---

## 📤 ÉTAPE 4 : Installer Dependencies Functions

```bash
cd functions
npm install
cd ..
```

**Temps estimé :** 30 secondes

---

## ☁️ ÉTAPE 5 : Activer le Plan Blaze (OBLIGATOIRE)

⚠️ **Les Cloud Functions nécessitent le plan Blaze**

1. Allez sur : https://console.firebase.google.com/project/memorymatrix-9781b/usage
2. Cliquez sur **"Modifier le forfait"**
3. Sélectionnez **"Plan Blaze"**
4. Ajoutez une carte de crédit (pas de frais tant que vous restez sous les quotas gratuits)
5. Validez

**Quotas gratuits généreux :**
- Invocations : 2M/mois
- GB-secondes : 400K/mois
- CPU-secondes : 200K/mois

**Pour Memory Matrix :** Largement suffisant (estimé < 1€/mois même avec 1000+ utilisateurs)

---

## 🚀 ÉTAPE 6 : Déployer Cloud Functions

```bash
firebase deploy --only functions
```

**Temps estimé :** 2-3 minutes

**Vous devriez voir :**
```
✔  Deploy complete!

Functions:
  sendPushNotification(us-central1)
  cleanupOldNotifications(us-central1)
  cleanupExpiredChallenges(us-central1)
  updateChallengeStats(us-central1)
  sendTestNotification(us-central1)
```

---

## 🔒 ÉTAPE 7 : Déployer Firestore Rules

```bash
firebase deploy --only firestore:rules
```

**Temps estimé :** 10 secondes

---

## 🧪 ÉTAPE 8 : Tester l'Application

```bash
# Lancer l'app
npx expo start

# Dans un autre terminal, suivre les logs
adb logcat | grep -i "fcm"
```

**Vérifications :**

1. ✅ L'app démarre sans erreur
2. ✅ Logs affichent : `FCM Token registered: <token>`
3. ✅ Créer un défi avec un ami
4. ✅ L'ami reçoit la notification "🎮 Nouveau défi"

---

## 🐛 Troubleshooting

### Erreur : "Cannot find module @react-native-firebase/messaging"

```bash
npm install @react-native-firebase/messaging
npx expo prebuild --clean
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

### Erreur : "Functions deployment requires Blaze plan"

→ Activez le plan Blaze (ÉTAPE 5)

### Erreur : "No FCM token"

```bash
# Vérifier que google-services.json est à jour
# Re-télécharger depuis Firebase Console si besoin
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

### Notifications ne s'affichent pas

1. Vérifier les logs Functions :
```bash
firebase functions:log
```

2. Vérifier Firestore collection `notifications` (doit contenir des docs)

3. Tester manuellement :
   - Firebase Console → Cloud Messaging → Envoyer message test
   - Coller le FCM token (depuis logs app)

---

## 📊 Vérifier que Tout Fonctionne

### 1. Vérifier le Token FCM

Logs app doivent afficher :
```
FCM Token registered: dXXXXXXXXXXXXXXXXXXXXXX
```

### 2. Vérifier Firestore

Collection `users` → Votre utilisateur → Champ `fcmToken` doit exister

### 3. Vérifier Functions Déployées

```bash
firebase functions:list
```

Doit afficher les 5 functions.

### 4. Test Complet

1. **Créer un défi** avec un ami
2. **Attendre 1-2 secondes**
3. **Vérifier notification** sur l'appareil de l'ami : "🎮 [Votre nom] vous défie en mode [Mode]"
4. **Accepter le défi**
5. **Vérifier notification** sur votre appareil : "✅ [Nom ami] a accepté votre défi"
6. **Jouer et terminer** votre partie
7. **Vérifier notification** sur l'appareil de l'ami : "⚡ [Votre nom] a terminé avec [Score] points"
8. **L'ami joue et termine**
9. **Les deux reçoivent** : "🏆 Victoire" ou "😔 Défaite"

---

## ✅ Checklist Finale

- [ ] Package `@react-native-firebase/messaging` installé
- [ ] App rebuild avec `npx expo prebuild --clean`
- [ ] Firebase CLI installé et connecté
- [ ] Firebase Functions initialisées
- [ ] Dependencies Functions installées
- [ ] Plan Blaze activé dans Firebase
- [ ] Cloud Functions déployées (5 functions)
- [ ] Firestore Rules déployées
- [ ] App lancée et FCM token enregistré
- [ ] Notification test manuelle réussie
- [ ] Notification de défi fonctionne
- [ ] Notification d'ami fonctionne

---

## 📞 Besoin d'Aide ?

### Logs Utiles

```bash
# Logs de l'app Android
adb logcat | grep -i "fcm\|notification"

# Logs Firebase Functions
firebase functions:log

# Logs détaillés d'une function spécifique
firebase functions:log --only sendPushNotification
```

### Ressources

- Guide complet : `GUIDE_PUSH_NOTIFICATIONS_FIREBASE.md`
- Résumé technique : `NOTIFICATIONS_IMPLEMENTATION_SUMMARY.md`
- Firebase Console : https://console.firebase.google.com/project/memorymatrix-9781b

---

**Prêt à Démarrer ?** → Copiez ÉTAPE 1 dans votre terminal ! 🚀

---

**Version :** 1.4.0  
**Date :** 3 novembre 2025  
**Temps total estimé :** 10-15 minutes
