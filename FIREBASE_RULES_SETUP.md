# 🔐 Configuration Firebase - Règles de Sécurité

## ⚠️ ERREUR ACTUELLE

```
[firestore/permission-denied] The caller does not have permission to execute the specified operation.
```

Cette erreur indique que les règles de sécurité Firestore n'autorisent pas l'accès à la collection `challenges`.

---

## 🛠️ SOLUTION : Déployer les Nouvelles Règles Firestore

### Option 1: Via la Console Firebase (RECOMMANDÉ)

1. **Accéder à la Console Firebase**
   - Ouvrez https://console.firebase.google.com
   - Sélectionnez votre projet Memory Matrix

2. **Ouvrir Firestore Database**
   - Dans le menu latéral, cliquez sur "Firestore Database"
   - Cliquez sur l'onglet "Règles" (Rules)

3. **Copier les Nouvelles Règles**
   - Remplacez le contenu actuel par le contenu du fichier `firestore.rules`
   - Ou copiez directement ci-dessous :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - accessible uniquement par le propriétaire
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // DisplayNames collection - lecture publique, écriture restreinte
    match /displayNames/{displayName} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Leaderboard collection - lecture publique, écriture par propriétaire
    match /leaderboard/{entryId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Challenges collection - NOUVEAU pour Phase 8
    match /challenges/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. **Publier les Règles**
   - Cliquez sur "Publier" (Publish)
   - Attendez la confirmation

### Option 2: Via Firebase CLI

Si vous avez Firebase CLI installé :

```powershell
# Initialiser Firebase dans le projet (si pas déjà fait)
firebase init firestore

# Déployer les règles
firebase deploy --only firestore:rules
```

---

## 📋 Collections Firestore Utilisées

### Existantes (déjà configurées)
- ✅ `users` - Profils utilisateurs
- ✅ `displayNames` - Index des pseudos
- ✅ `leaderboard` - Classement

### Nouvelle (Phase 8)
- 🆕 `challenges` - Progrès des défis quotidiens

---

## 🔒 Sécurité des Règles

### Règles de la Collection `challenges`

```javascript
match /challenges/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**Explication :**
- `{userId}` : Le document a le même ID que l'utilisateur
- `request.auth != null` : L'utilisateur doit être authentifié
- `request.auth.uid == userId` : L'utilisateur ne peut accéder qu'à SES propres défis

**Sécurité :**
- ✅ Un utilisateur ne peut pas voir les défis d'un autre
- ✅ Un utilisateur ne peut pas modifier les défis d'un autre
- ✅ Les utilisateurs non authentifiés n'ont aucun accès
- ✅ Protection contre la triche

---

## 🧪 Tester les Règles

### Dans la Console Firebase

1. Allez dans l'onglet "Règles"
2. Cliquez sur "Simulateur de règles"
3. Testez les scénarios :

**Scénario 1 : Lecture de ses propres défis**
```
Type: get
Location: /challenges/USER_ID_123
Auth: Authenticated as USER_ID_123
Résultat attendu: ✅ Allow
```

**Scénario 2 : Lecture des défis d'un autre**
```
Type: get
Location: /challenges/USER_ID_456
Auth: Authenticated as USER_ID_123
Résultat attendu: ❌ Deny
```

---

## ⚡ Après le Déploiement

1. **Redémarrer l'application**
   ```powershell
   # Arrêter l'app (Ctrl+C dans le terminal Expo)
   # Puis relancer
   npm start
   ```

2. **Tester les défis quotidiens**
   - Ouvrir l'app
   - Cliquer sur "🎯 DÉFIS QUOTIDIENS"
   - Vérifier que les défis s'affichent sans erreur

3. **Vérifier dans la Console Firestore**
   - Une nouvelle collection `challenges` devrait apparaître
   - Avec des documents ayant l'ID de vos utilisateurs

---

## 🐛 Dépannage

### Si l'erreur persiste après le déploiement

1. **Vérifier que les règles sont bien publiées**
   - Console Firebase → Firestore → Règles
   - Vérifier la date de dernière modification

2. **Vider le cache de l'app**
   ```powershell
   npm start -- --clear
   ```

3. **Vérifier l'authentification**
   - L'utilisateur est-il bien connecté ?
   - Vérifier dans les logs : `currentUser?.uid`

4. **Tester avec un nouvel utilisateur**
   - Se déconnecter
   - Se reconnecter en mode invité
   - Essayer d'accéder aux défis

### Si les warnings API Firebase persistent

Les warnings sur l'API dépréciée ne sont **pas critiques** pour le moment. Ils indiquent simplement que React Native Firebase migre vers une nouvelle API. Cela fonctionnera jusqu'à la version 22.

Pour les supprimer (optionnel), il faudrait migrer vers la nouvelle API modulaire, mais ce n'est **pas urgent**.

---

## ✅ Checklist de Vérification

Après avoir déployé les règles :

- [ ] Règles publiées dans Firebase Console
- [ ] App redémarrée
- [ ] Écran "Défis Quotidiens" accessible
- [ ] Pas d'erreur `permission-denied`
- [ ] Les défis s'affichent correctement
- [ ] Les progrès sont trackés pendant le jeu
- [ ] Les récompenses peuvent être réclamées

---

## 📝 Notes Importantes

1. **Production vs Développement**
   - Ces règles sont adaptées pour la production
   - Elles garantissent la sécurité des données

2. **Migration Future**
   - Les warnings API sont normaux
   - Pas d'impact sur le fonctionnement
   - Migration vers v22 peut être planifiée plus tard

3. **Backup des Règles**
   - Le fichier `firestore.rules` sert de backup
   - Toujours versionner ce fichier avec Git

---

**Une fois les règles déployées, l'erreur `permission-denied` sera résolue et les défis quotidiens fonctionneront parfaitement ! 🎉**
