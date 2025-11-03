# 🔒 Déploiement des Règles Firestore - URGENT

## ⚠️ Problème Actuel

Les erreurs de permission indiquent que les nouvelles collections sociales ne sont pas accessibles :
```
[firestore/permission-denied] The caller does not have permission to execute the specified operation.
```

## ✅ Solution : Mettre à jour les règles Firestore

### Méthode 1 : Via Firebase Console (RAPIDE - 2 minutes)

1. **Ouvrir Firebase Console**
   - Aller sur https://console.firebase.google.com
   - Sélectionner le projet "Memory Matrix"

2. **Accéder aux règles**
   - Menu latéral → **Firestore Database**
   - Onglet **Règles** (Rules)

3. **Copier-coller les nouvelles règles**
   - Ouvrir le fichier `firestore.rules` de ce projet
   - Sélectionner TOUT le contenu
   - Coller dans l'éditeur Firebase Console (remplacer l'ancien contenu)

4. **Publier**
   - Cliquer sur **Publier** (Publish)
   - Attendre confirmation "Règles publiées avec succès"

### Méthode 2 : Via Firebase CLI (si installé)

```bash
# Dans le dossier du projet
firebase deploy --only firestore:rules
```

## 📋 Nouvelles règles ajoutées

Les règles mises à jour incluent maintenant :

### 1. Friends (sous-collection)
```
match /friends/{userId}/userFriends/{friendId}
  - Lecture/Écriture : propriétaire uniquement
```

### 2. Friend Requests
```
match /friendRequests/{requestId}
  - Lecture : expéditeur OU destinataire
  - Création : expéditeur uniquement
  - Mise à jour : destinataire uniquement
  - Suppression : expéditeur OU destinataire
```

### 3. Friend Challenges
```
match /friendChallenges/{challengeId}
  - Lecture : challenger OU opponent
  - Création : challenger uniquement
  - Mise à jour : les deux participants
  - Suppression : conditions spécifiques
```

## ✅ Vérification

Après publication, **redémarrer l'application** :

```bash
# Arrêter l'app (Ctrl+C dans le terminal)
# Relancer
npx expo start
```

Les erreurs de permission devraient disparaître !

## 🔍 Test rapide

1. Ouvrir l'app
2. Aller dans "👥 Amis"
3. Si aucune erreur dans la console → ✅ Règles OK
4. Si toujours des erreurs → Vérifier que les règles sont bien publiées

## 🐛 Dépannage

**Erreur persiste après publication ?**
- Attendre 1-2 minutes (propagation Firebase)
- Vider le cache de l'app : `npx expo start -c`
- Vérifier dans Firebase Console > Règles que les nouvelles règles sont visibles

**Autres erreurs ?**
- Vérifier que l'utilisateur est bien connecté
- Vérifier les index Firestore (voir FIRESTORE_INDEXES.md)

---

**IMPORTANT :** Sans ces règles, le système social ne fonctionnera pas !
