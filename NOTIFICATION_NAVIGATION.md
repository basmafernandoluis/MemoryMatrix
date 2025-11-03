# Navigation depuis les Notifications Push

## Vue d'ensemble

Lorsqu'un utilisateur clique sur une notification push, l'application navigue automatiquement vers l'écran approprié avec le contexte nécessaire.

## Flux de navigation implémenté

### 1. Demandes d'amis
**Notification**: "Nouvelle demande d'ami"
- **Écran**: Friends Screen
- **Onglet**: Requests
- **Action**: L'utilisateur peut accepter ou refuser la demande

### 2. Ami accepté
**Notification**: "Votre demande d'ami a été acceptée"
- **Écran**: Friends Screen
- **Onglet**: Friends List
- **Action**: L'utilisateur voit son nouvel ami dans la liste

### 3. Défi reçu
**Notification**: "Nouveau défi de [Nom]"
- **Écran**: Friend Challenges Screen
- **Onglet**: Pending (En attente)
- **Mise en évidence**: Le défi est surligné en bleu avec badge "🔔 Nouveau"
- **Action**: L'utilisateur peut accepter ou refuser le défi

### 4. Défi accepté
**Notification**: "[Nom] a accepté votre défi"
- **Écran**: Friend Challenges Screen
- **Onglet**: Active
- **Mise en évidence**: Le défi est surligné avec badge "🔔 Nouveau"
- **Action**: L'utilisateur peut jouer sa partie

### 5. Score soumis
**Notification**: "[Nom] a joué son score : [Score]"
- **Écran**: Friend Challenges Screen
- **Onglet**: Active
- **Mise en évidence**: Le défi est surligné
- **Action**: Si l'utilisateur n'a pas joué, bouton "🎮 Jouer maintenant"

### 6. Défi terminé
**Notification**: "Défi terminé ! Résultat : Victoire/Défaite"
- **Écran**: Friend Challenges Screen
- **Onglet**: Completed (Historique)
- **Mise en évidence**: Le défi est surligné
- **Action**: L'utilisateur peut voir les scores finaux et le résultat

## Architecture technique

### 1. notificationService.ts
```typescript
class NotificationService {
  private navigationCallback: ((screen: string, params?: any) => void) | null = null;

  setNavigationCallback(callback: (screen: string, params?: any) => void): void {
    this.navigationCallback = callback;
  }

  private handleNotificationNavigation(remoteMessage): void {
    // Extrait les données de la notification
    // Appelle navigationCallback avec l'écran et les paramètres appropriés
  }
}
```

**États gérés**:
- **Foreground**: Alert + navigation immédiate
- **Background**: Notification système → navigation au clic
- **Quit state**: Notification système → navigation au clic

### 2. App.tsx
```typescript
const handleNotificationNavigation = (screen: string, params?: any) => {
  switch (screen) {
    case 'friends':
      setCurrentScreen('friends');
      break;
    
    case 'friendChallenges':
      setNotificationTab(params.tab); // 'pending' | 'active' | 'history'
      setNotificationChallengeId(params.challengeId); // ID du défi à mettre en évidence
      setCurrentScreen('friendChallenges');
      break;
  }
};

// Dans useEffect après auth
notificationService.setNavigationCallback(handleNotificationNavigation);
```

### 3. FriendChallengesScreen.tsx
```typescript
interface FriendChallengesScreenProps {
  initialTab?: 'pending' | 'active' | 'history';
  highlightChallengeId?: string;
}

// Utilisation
const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'active');

useEffect(() => {
  if (initialTab) {
    setActiveTab(initialTab);
  }
}, [initialTab]);

// Dans le rendu
<View style={[
  styles.challengeCard,
  highlightChallengeId === item.id && styles.highlightedCard
]}>
  {highlightChallengeId === item.id && (
    <Text style={styles.newBadge}>🔔 Nouveau</Text>
  )}
</View>
```

## Styles de mise en évidence

### Badge "Nouveau"
```typescript
newBadge: {
  fontSize: 11,
  fontWeight: 'bold',
  color: '#2196F3',
  backgroundColor: 'rgba(33, 150, 243, 0.2)',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
}
```

### Carte mise en évidence
```typescript
highlightedCard: {
  borderWidth: 2,
  borderColor: '#2196F3',
  backgroundColor: 'rgba(33, 150, 243, 0.1)',
}
```

## Données passées dans les notifications

### Structure Cloud Function (sendPushNotification)
```typescript
const message = {
  notification: {
    title: notificationData.title,
    body: notificationData.body,
  },
  data: {
    type: notificationData.type,
    senderId: notificationData.senderId,
    senderName: notificationData.senderName,
    challengeId: notificationData.challengeId || '',
    requestId: notificationData.requestId || '',
    // ... autres données
  },
  token: userDoc.data().fcmToken,
};
```

### Mapping type → navigation
| Type de notification | Écran | Onglet | Data requise |
|---------------------|--------|--------|--------------|
| `friend_request` | friends | requests | `requestId` |
| `friend_accepted` | friends | friends | - |
| `challenge_received` | friendChallenges | pending | `challengeId` |
| `challenge_accepted` | friendChallenges | active | `challengeId` |
| `challenge_score_submitted` | friendChallenges | active | `challengeId` |
| `challenge_completed` | friendChallenges | history | `challengeId` |

## Tests de navigation

### Scénario 1 : App en foreground
1. Utilisateur A envoie un défi à Utilisateur B
2. Utilisateur B (app ouverte) reçoit une Alert
3. Utilisateur B clique "OK"
4. → Navigation automatique vers Friend Challenges > Pending
5. → Défi surligné avec badge "🔔 Nouveau"

### Scénario 2 : App en background
1. Utilisateur A accepte le défi
2. Utilisateur B (app en arrière-plan) voit notification système
3. Utilisateur B clique sur la notification
4. → App s'ouvre et navigue vers Friend Challenges > Active
5. → Défi surligné

### Scénario 3 : App fermée
1. Utilisateur A soumet son score
2. Utilisateur B (app fermée) reçoit notification système
3. Utilisateur B clique sur la notification
4. → App démarre et navigue vers Friend Challenges > Active
5. → Défi surligné avec bouton "Jouer maintenant"

## Nettoyage des paramètres

Lorsque l'utilisateur quitte l'écran Friend Challenges :
```typescript
const handleCloseFriendChallenges = () => {
  setNotificationTab(undefined);
  setNotificationChallengeId(undefined);
  transitionToScreen('home');
};
```

Cela garantit que la prochaine ouverture de l'écran ne sera pas affectée par les anciens paramètres de notification.

## Améliorations futures possibles

1. **Animation d'entrée** : Animer le scroll vers le défi mis en évidence
2. **Badge temporel** : Retirer automatiquement le badge "Nouveau" après X secondes
3. **Navigation profonde** : Ouvrir directement le modal de jeu pour un défi
4. **Historique de navigation** : Permettre le retour arrière vers l'écran d'origine
5. **Deep linking** : Supporter les liens externes (partage de défis)
