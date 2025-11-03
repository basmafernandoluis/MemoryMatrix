# 🚀 Démarrage Rapide - Push Notifications

Guide condensé pour activer les notifications push en 10 minutes.

---

## ⚡ Installation Express

### 1. Installer la dépendance (1 min)

```bash
npm install @react-native-firebase/messaging
```

### 2. Rebuild l'app (3 min)

```bash
npx expo prebuild --clean
cd android
./gradlew assembleDebug
```

### 3. Initialiser Firebase Functions (2 min)

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

Choisir :
- **TypeScript** ✅
- **ESLint** ✅
- **Install dependencies** ✅

### 4. Déployer les Cloud Functions (2 min)

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

**⚠️ Nécessite le plan Blaze (facturation activée)**

### 5. Tester (2 min)

1. Lancez l'app
2. Vérifiez les logs : `FCM Token registered`
3. Créez un défi avec un ami
4. L'ami doit recevoir une notification !

---

## 🧪 Test Manuel

### Envoyer une notification test :

1. Firebase Console → **Cloud Messaging**
2. **Envoyer un message test**
3. Collez le FCM token (voir logs app)
4. **Envoyer**

### Voir les logs :

```bash
# Logs des functions
firebase functions:log

# Logs de l'app
npx expo start
```

---

## ✅ Checklist Rapide

- [ ] `@react-native-firebase/messaging` installé
- [ ] App rebuild
- [ ] Firebase Functions initialisées
- [ ] Plan Blaze activé
- [ ] Functions déployées
- [ ] Token FCM visible dans les logs
- [ ] Notification de test reçue
- [ ] Notification de défi fonctionne

---

## 🐛 Problèmes Courants

### "No FCM token"
```bash
npx expo prebuild --clean
cd android && ./gradlew assembleDebug
```

### "Functions deployment failed"
→ Activez le plan Blaze dans Firebase Console

### "Permission denied"
→ Acceptez les permissions de notification dans les paramètres de l'app

---

## 📖 Guide Complet

Pour la configuration détaillée : `GUIDE_PUSH_NOTIFICATIONS_FIREBASE.md`

---

**Version :** 1.4.0  
**Date :** 3 novembre 2025
