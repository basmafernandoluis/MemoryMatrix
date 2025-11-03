# 🌐 Fonctionnalités Sociales - Phase 13

Documentation complète du système social de Memory Matrix implémenté en **v1.4.0**.

## 📋 Vue d'ensemble

Le système social permet aux joueurs de :
- **Ajouter des amis** et gérer leurs connexions sociales
- **Défier leurs amis** dans différents modes de jeu
- **Partager leurs scores** sur les réseaux sociaux

## 🎯 Fonctionnalités implémentées

### 1. Système d'amis 👥

#### Services (`friendsService.ts`)
Gestion complète du système d'amis avec Firestore :

**Collections Firestore utilisées :**
- `friends/{userId}/userFriends/{friendId}` - Liste des amis (bidirectionnelle)
- `friendRequests` - Demandes d'amis en attente
- `users` - Profils utilisateurs avec `displayNameLower` pour la recherche

**Fonctionnalités principales :**

```typescript
// Recherche d'utilisateurs
searchUsers(currentUserId, searchQuery) 
// -> Recherche par displayNameLower (case-insensitive)
// -> Retourne le statut d'amitié (none, friend, pending-sent, pending-received)

// Envoi de demande d'ami
sendFriendRequest(fromUserId, fromDisplayName, fromAvatarEmoji, toUserId)
// -> Vérifie si demande existe déjà
// -> Auto-acceptation si demande inverse existe
// -> Création de la demande en Firestore

// Acceptation de demande
acceptFriendRequest(userId, requestId)
// -> Crée l'amitié bidirectionnelle
// -> Met à jour le statut de la demande
// -> Transaction atomique Firestore

// Refus/Annulation
rejectFriendRequest(userId, requestId)
cancelFriendRequest(userId, requestId)

// Suppression d'ami
removeFriend(userId, friendId)
// -> Suppression bidirectionnelle

// Abonnements temps réel
subscribeToFriends(userId, callback)
subscribeToFriendRequests(userId, callback)
```

#### Interface utilisateur (`FriendsScreen.tsx`)

**3 onglets :**
1. **Amis** - Liste des amis avec actions :
   - ⚔️ Défier (lance l'écran de création de défi)
   - ❌ Supprimer

2. **Demandes** - Gestion des demandes :
   - **Demandes reçues** : ✓ Accepter / ✗ Refuser
   - **Demandes envoyées** : Annuler (en attente)

3. **Rechercher** - Recherche d'utilisateurs :
   - Champ de recherche (min 2 caractères)
   - Résultats avec statut :
     - `+ Ajouter` : Envoyer demande
     - `✓ Ami` : Déjà ami
     - `⏳ En attente` : Demande envoyée
     - `✓ Accepter` : Demande reçue

**Design :**
- Cards avec avatar emoji + nom + niveau
- Badges de notification pour les demandes reçues
- États vides avec emojis explicatifs
- Animations fluides

### 2. Défis entre amis ⚔️

#### Service (`friendChallengesService.ts`)

**Collection Firestore :**
- `friendChallenges` - Défis avec statut (pending, active, completed, expired)

**Structure d'un défi :**
```typescript
interface FriendChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerAvatar: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  mode: GameMode; // classic, survival, timeAttack, zen
  status: 'pending' | 'active' | 'completed' | 'expired';
  
  // Scores
  challengerScore?: number;
  challengerLevel?: number;
  opponentScore?: number;
  opponentLevel?: number;
  winnerId?: string;
  
  // Timestamps
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  expiresAt: Date; // 24h après création
}
```

**Fonctionnalités :**

```typescript
// Création de défi
createChallenge(challengerId, ..., opponentId, mode)
// -> Expire après 24h
// -> Vérifie qu'aucun défi actif n'existe

// Acceptation/Refus
acceptChallenge(userId, challengeId)
rejectChallenge(userId, challengeId)

// Soumission de score
submitChallengeScore(userId, challengeId, score, level)
// -> Auto-détection du gagnant quand les 2 scores sont soumis
// -> Critères : score > level en cas d'égalité

// Récupération
getPendingChallenges(userId) // Défis reçus
getActiveChallenges(userId) // Défis acceptés
getCompletedChallenges(userId, limit) // Historique
getChallengeStats(userId) // Stats globales

// Abonnements
subscribeToPendingChallenges(userId, callback)
subscribeToActiveChallenges(userId, callback)

// Maintenance
cleanupExpiredChallenges() // À appeler périodiquement
```

#### Interface (`FriendChallengesScreen.tsx`)

**En-tête :**
- Bouton `+` pour créer un défi
- Statistiques : Total | Victoires | Défaites | % Victoires

**3 onglets :**

1. **Reçus** - Défis en attente d'acceptation
   - Affichage : Avatar + Nom + Mode + Temps restant
   - Actions : ✓ Accepter | ✗ Refuser

2. **Actifs** - Défis acceptés en cours
   - Affichage : vs Nom + Scores (Toi | VS | Adversaire)
   - Bouton `🎮 Jouer maintenant` si score non soumis
   - Auto-refresh en temps réel

3. **Historique** - Défis terminés
   - Badge 🏆 Victoire ou ❌ Défaite
   - Affichage des scores finaux

**Modal de création :**
1. Sélection d'un ami
2. Choix du mode de jeu (🎯 Classique, 💪 Survie, ⚡ Temps, 🧘 Zen)

### 3. Partage sur réseaux sociaux 📤

#### Service (`shareService.ts`)

Utilise l'API native **Share** de React Native.

**Fonctionnalités :**

```typescript
// Partager un score
shareScore(options: ShareOptions)
// -> Génère un message personnalisé par mode
// -> Inclut le lien Google Play
// -> Détecte la plateforme de partage

// Partager un défi
shareChallenge(friendName, mode, targetScore?)
// -> Message de défi personnalisé

// Partager une victoire
shareChallengeVictory(friendName, mode, myScore, friendScore)

// Partager l'application
shareApp()
// -> Message promotionnel générique
```

**Génération de messages :**

Exemple pour mode Survie :
```
🎮 Memory Matrix

🏆 NOUVEAU RECORD ! 🏆

Mode Survie 💪
Série de 15 niveaux réussis !
Score: 3450 points

🏅 Classement: #12

Peux-tu battre mon score ? 🔥
Télécharge Memory Matrix !

https://play.google.com/store/apps/details?id=com.appwizards.MemoryMatrix
```

**Plateformes détectées :**
- Facebook
- Twitter
- Instagram
- WhatsApp
- Autres (email, SMS, etc.)

#### Intégration (`GameOverScreen.tsx`)

**Bouton ajouté :**
- `📤 PARTAGER` entre "REJOUER" et "ACCUEIL"
- Appelle `shareService.shareScore()` avec :
  - Score, niveau, mode
  - Rang (si disponible)
  - Flag nouveau record

## 🗂️ Structure des fichiers

```
src/
├── services/
│   ├── friendsService.ts           (420 lignes)
│   ├── friendChallengesService.ts  (485 lignes)
│   └── shareService.ts             (310 lignes)
├── screens/
│   ├── FriendsScreen.tsx           (670 lignes)
│   ├── FriendChallengesScreen.tsx  (550 lignes)
│   └── GameOverScreen.tsx          (modifié - bouton partage)
└── types/
    └── index.ts                    (types Friend, FriendChallenge, ShareOptions)
```

## 🔧 Intégration dans l'app

### Navigation (`App.tsx`)

**Écrans ajoutés :**
```typescript
type Screen = 'onboarding' | 'login' | 'home' | 'game' | 
              'gameover' | 'leaderboard' | 'profile' | 
              'challenges' | 'friends' | 'friendChallenges';
```

**Handlers :**
```typescript
handleOpenFriends() -> FriendsScreen
handleOpenFriendChallenges() -> FriendChallengesScreen
handleChallengeFriend(friendId) -> FriendChallengesScreen
```

### Menu principal (`HomeScreen.tsx`)

**Bouton ajouté :**
```
👥 Amis
```
- Positionné entre "Défis" et "Profil"
- Conditionnel (si `onOpenFriends` existe)

## 📊 Structure Firestore

### Collection `friends`
```
friends/{userId}/userFriends/{friendId}
  - userId: string
  - displayName: string
  - avatarEmoji: string
  - level: number
  - addedAt: timestamp
  - lastPlayed?: timestamp
```

### Collection `friendRequests`
```
friendRequests/{requestId}
  - fromUserId: string
  - fromDisplayName: string
  - fromAvatarEmoji: string
  - toUserId: string
  - status: 'pending' | 'accepted' | 'rejected'
  - createdAt: timestamp
  - respondedAt?: timestamp
```

### Collection `friendChallenges`
```
friendChallenges/{challengeId}
  - challengerId: string
  - challengerName: string
  - challengerAvatar: string
  - opponentId: string
  - opponentName: string
  - opponentAvatar: string
  - mode: GameMode
  - status: 'pending' | 'active' | 'completed' | 'expired'
  - challengerScore?: number
  - challengerLevel?: number
  - opponentScore?: number
  - opponentLevel?: number
  - winnerId?: string
  - createdAt: timestamp
  - acceptedAt?: timestamp
  - completedAt?: timestamp
  - expiresAt: timestamp
```

## 🔍 Index Firestore requis

**Créer ces index dans Firebase Console :**

1. **Recherche d'utilisateurs :**
```
Collection: users
Fields: displayNameLower (Ascending), __name__ (Ascending)
```

2. **Demandes d'amis reçues :**
```
Collection: friendRequests
Fields: toUserId (Ascending), status (Ascending), createdAt (Descending)
```

3. **Demandes d'amis envoyées :**
```
Collection: friendRequests
Fields: fromUserId (Ascending), status (Ascending), createdAt (Descending)
```

4. **Défis en attente :**
```
Collection: friendChallenges
Fields: opponentId (Ascending), status (Ascending), createdAt (Descending)
```

5. **Défis actifs (challenger) :**
```
Collection: friendChallenges
Fields: challengerId (Ascending), status (Ascending), createdAt (Descending)
```

6. **Défis actifs (opponent) :**
```
Collection: friendChallenges
Fields: opponentId (Ascending), status (Ascending), createdAt (Descending)
```

7. **Défis terminés (challenger) :**
```
Collection: friendChallenges
Fields: challengerId (Ascending), status (Ascending), completedAt (Descending)
```

8. **Défis terminés (opponent) :**
```
Collection: friendChallenges
Fields: opponentId (Ascending), status (Ascending), completedAt (Descending)
```

9. **Nettoyage des défis expirés :**
```
Collection: friendChallenges
Fields: status (Ascending), expiresAt (Ascending)
```

## ⚡ Optimisations

### Recherche d'amis
- Index sur `displayNameLower` pour recherche case-insensitive
- Limitation à 20 résultats
- Debouncing recommandé (minimum 2 caractères)

### Défis
- Expiration automatique après 24h
- Batch queries pour récupérer défis actifs (challenger + opponent)
- Limitation historique par défaut : 20 défis

### Temps réel
- Subscriptions Firestore pour :
  - Liste d'amis
  - Demandes d'amis reçues
  - Défis en attente
  - Défis actifs
- Auto-cleanup des listeners au démontage

## 🧪 Tests recommandés

### Système d'amis
- [ ] Rechercher un utilisateur par nom
- [ ] Envoyer une demande d'ami
- [ ] Accepter/Refuser une demande
- [ ] Supprimer un ami
- [ ] Tester auto-acceptation (demandes croisées)
- [ ] Vérifier notifications temps réel

### Défis
- [ ] Créer un défi avec un ami
- [ ] Accepter/Refuser un défi
- [ ] Soumettre un score
- [ ] Vérifier calcul du gagnant
- [ ] Tester expiration (24h)
- [ ] Vérifier statistiques

### Partage
- [ ] Partager un score (mode classique)
- [ ] Partager un score (mode survie)
- [ ] Partager un nouveau record
- [ ] Tester sur différentes plateformes

## 🐛 Points d'attention

### Données utilisateurs
- Le champ `displayNameLower` doit être ajouté pour les utilisateurs existants
- Utiliser `firestore.ts:updateProfile()` qui le génère automatiquement
- Migration manuelle possible si nécessaire

### Sécurité Firestore
Règles recommandées :

```javascript
// Friends
match /friends/{userId}/userFriends/{friendId} {
  allow read: if request.auth.uid == userId;
  allow write: if false; // Géré par les services
}

// Friend Requests
match /friendRequests/{requestId} {
  allow read: if request.auth.uid == resource.data.fromUserId 
              || request.auth.uid == resource.data.toUserId;
  allow write: if false; // Géré par les services
}

// Friend Challenges
match /friendChallenges/{challengeId} {
  allow read: if request.auth.uid == resource.data.challengerId 
              || request.auth.uid == resource.data.opponentId;
  allow write: if false; // Géré par les services
}
```

### Maintenance
- Nettoyer périodiquement les défis expirés avec `cleanupExpiredChallenges()`
- Envisager un Cloud Function pour nettoyage automatique
- Supprimer les demandes d'amis rejetées après X jours

## 📈 Évolutions futures

### Phase 14 - Améliorations sociales
- [ ] Notifications push pour :
  - Nouvelle demande d'ami
  - Défi reçu
  - Score battu par un ami
- [ ] Chat entre amis
- [ ] Équipes/Guildes
- [ ] Tournois entre amis

### Phase 15 - Partage avancé
- [ ] Génération d'images de score (avec canvas)
- [ ] Deep links pour inviter directement
- [ ] Partage de replays
- [ ] Codes QR pour ajouter des amis

### Analytics
- Taux d'envoi de demandes d'amis
- Taux d'acceptation
- Nombre moyen de défis par utilisateur
- Plateforme de partage la plus utilisée

## 🎨 Design

### Palette de couleurs
- Amis : `#4CAF50` (vert)
- Défis : `#FF9800` (orange)
- Partage : `#2196F3` (bleu)
- Victoire : `#4CAF50` (vert)
- Défaite : `#f44336` (rouge)

### Emojis utilisés
- 👥 Amis
- ⚔️ Défier
- 📤 Partager
- 🏆 Victoire
- ❌ Défaite
- ✓ Accepter
- ✗ Refuser
- 🎮 Jouer

## 📝 Changelog

### v1.4.0 - Fonctionnalités Sociales
- ✅ Système d'amis complet
- ✅ Défis entre amis
- ✅ Partage sur réseaux sociaux
- ✅ Interface FriendsScreen
- ✅ Interface FriendChallengesScreen
- ✅ Bouton partage dans GameOverScreen
- ✅ Navigation intégrée
- ✅ Documentation complète

## 🔗 Liens utiles

- [Documentation Firestore](https://firebase.google.com/docs/firestore)
- [React Native Share API](https://reactnative.dev/docs/share)
- [Firebase Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

---

**Développé avec ❤️ par AppWizards**
**Memory Matrix v1.4.0**
