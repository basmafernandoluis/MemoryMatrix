# 🔧 Instructions de création des index Firestore

## Méthode Automatique (Recommandée)

Les index seront suggérés automatiquement par Firebase lors de la première utilisation des requêtes.

**Procédure :**
1. Ouvrir l'application
2. Aller dans "Amis" → "Rechercher"
3. Taper un nom → Une erreur apparaît dans la console Firebase
4. Cliquer sur le lien dans l'erreur → Index créé automatiquement
5. Répéter pour "Défis entre amis"

## Méthode Manuelle

Si vous préférez créer tous les index d'un coup :

### 1. Index de recherche d'utilisateurs
```
Collection: users
Champs indexés:
  - displayNameLower (Ascendant)
  - __name__ (Ascendant)
Mode de requête: Collection
```

### 2. Demandes d'amis reçues
```
Collection: friendRequests
Champs indexés:
  - toUserId (Ascendant)
  - status (Ascendant)
  - createdAt (Descendant)
Mode de requête: Collection
```

### 3. Demandes d'amis envoyées
```
Collection: friendRequests
Champs indexés:
  - fromUserId (Ascendant)
  - status (Ascendant)
  - createdAt (Descendant)
Mode de requête: Collection
```

### 4. Défis en attente (reçus)
```
Collection: friendChallenges
Champs indexés:
  - opponentId (Ascendant)
  - status (Ascendant)
  - createdAt (Descendant)
Mode de requête: Collection
```

### 5. Défis actifs (challenger)
```
Collection: friendChallenges
Champs indexés:
  - challengerId (Ascendant)
  - status (Ascendant)
  - createdAt (Descendant)
Mode de requête: Collection
```

### 6. Défis actifs (opponent)
```
Collection: friendChallenges
Champs indexés:
  - opponentId (Ascendant)
  - status (Ascendant)
  - createdAt (Descendant)
Mode de requête: Collection
```

### 7. Défis terminés (challenger)
```
Collection: friendChallenges
Champs indexés:
  - challengerId (Ascendant)
  - status (Ascendant)
  - completedAt (Descendant)
Mode de requête: Collection
```

### 8. Défis terminés (opponent)
```
Collection: friendChallenges
Champs indexés:
  - opponentId (Ascendant)
  - status (Ascendant)
  - completedAt (Descendant)
Mode de requête: Collection
```

### 9. Nettoyage des défis expirés
```
Collection: friendChallenges
Champs indexés:
  - status (Ascendant)
  - expiresAt (Ascendant)
Mode de requête: Collection
```

## Accès Firebase Console

1. Aller sur https://console.firebase.google.com
2. Sélectionner votre projet "Memory Matrix"
3. Menu latéral → **Firestore Database**
4. Onglet **Indexes**
5. Cliquer sur **Create Index**
6. Remplir les champs selon les spécifications ci-dessus
7. Cliquer sur **Create**

## Vérification

Une fois les index créés, ils apparaîtront dans la liste avec le statut :
- 🔄 **Building** (en cours de création)
- ✅ **Enabled** (actif et prêt)

Le temps de création dépend de la quantité de données (généralement quelques minutes pour une nouvelle app).

## Ordre de priorité

Si vous créez les index manuellement, suivez cet ordre :

1. **Index 1** (recherche utilisateurs) - Le plus utilisé
2. **Index 2 et 3** (demandes d'amis)
3. **Index 4, 5, 6** (défis actifs)
4. **Index 7 et 8** (historique)
5. **Index 9** (maintenance)

## Dépannage

**Erreur : "The query requires an index"**
→ Cliquez sur le lien dans l'erreur pour créer l'index automatiquement

**Index bloqué en "Building"**
→ Attendez quelques minutes, Firebase indexe les données existantes

**Requête toujours lente après création de l'index**
→ Vérifiez que l'index est "Enabled" et non "Building"

---

**Note :** Ces index sont OBLIGATOIRES pour le fonctionnement du système social. Sans eux, les requêtes échoueront.
