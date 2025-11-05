# Guide d'Intégration AdMob - Memory Matrix

## ✅ Installation et Configuration (TERMINÉ)

### 1. Package installé
```bash
npm install react-native-google-mobile-ads
```

### 2. Configuration app.json
```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-7435856398879419~3521141326",
        "iosAppId": "ca-app-pub-7435856398879419~3521141326"
      }
    ]
  ]
}
```

### 3. IDs AdMob configurés
- **App ID**: `ca-app-pub-7435856398879419~3521141326`
- **Bannière**: `ca-app-pub-7435856398879419/6683572857`
- **Interstitiel**: `ca-app-pub-7435856398879419/7797822903`
- **Interstitiel Récompensé**: `ca-app-pub-7435856398879419/1755158732`

## 📦 Fichiers Créés

### Services
- ✅ `src/services/adManager.ts` - Gestion centralisée des publicités

### Composants
- ✅ `src/components/BannerAdComponent.tsx` - Bannières adaptatives
- ✅ `src/components/RewardedAdButton.tsx` - Bouton vidéo récompensée

## 🎯 Stratégie de Monétisation

### Bannières (320x50 adaptatif)
**Où**: Écrans statiques seulement
- ✅ HomeScreen (implémenté)
- 📋 À ajouter: LeaderboardScreen, ProfileScreen, FriendsScreen

**Position**: Bottom fixe avec safe area

**Refresh**: Automatique par AdMob (30-60s)

### Interstitiels
**Timing**: Maximum 1 toutes les 3 minutes
- Premier interstitiel après 2 minutes d'usage
- Maximum 3 pubs par session de 10 minutes

**Points d'affichage implémentés**:
- ✅ "Rejouer" depuis GameOver
- ✅ "Retour au menu" depuis GameOver

**À ajouter**:
- 📋 Après la 5ème partie consécutive
- 📋 Changement de mode de jeu
- 📋 Sortie de l'écran de classement

### Vidéos Récompensées (Optionnel)
**Récompenses suggérées**:
- 📋 3 vies supplémentaires en mode Survie
- 📋 +30 secondes en mode Contre-la-Montre
- 📋 Révéler 2 cases en mode difficile
- 📋 Doubler le score du prochain niveau
- 📋 Obtenir un hint pour le pattern

**Où proposer**:
- GameOverScreen (continuer la partie)
- Avant de commencer un défi difficile
- Débloquer un mode premium temporairement

## 🔧 Prochaines Étapes

### 1. Rebuild l'application
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### 2. Tester avec les Test IDs
L'app utilise automatiquement les test IDs en mode `__DEV__`

Vérifier:
- [ ] Bannière apparaît sur HomeScreen
- [ ] Interstitiel s'affiche après "Rejouer" (respecte le timing)
- [ ] Interstitiel s'affiche après "Retour menu" (respecte le timing)
- [ ] Logs indiquent le bon fonctionnement

### 3. Ajouter les vidéos récompensées

**Exemple dans GameOverScreen**:
```tsx
import { RewardedAdButton } from '../components/RewardedAdButton';

// Dans le render
<RewardedAdButton
  rewardIcon="💪"
  rewardDescription="Continuer la partie"
  onReward={() => {
    // Restaurer la vie du joueur et continuer
    handleContinue();
  }}
/>
```

### 4. Ajouter bannières aux autres écrans

**LeaderboardScreen**:
```tsx
import { BannerAdComponent } from '../components/BannerAdComponent';

// Avant la fermeture </SafeAreaView>
<BannerAdComponent position="bottom" />
```

**ProfileScreen**: Idem

### 5. Ajouter plus d'interstitiels

**Exemple - Après 5 parties**:
```tsx
// Dans App.tsx, handleGameOver
const gamesPlayed = userProgress.totalGamesPlayed;
if (gamesPlayed > 0 && gamesPlayed % 5 === 0) {
  await adManager.showInterstitial();
}
```

## 📊 Monitoring des Performances

### Logs à surveiller
```
✅ "AdMob initialized successfully"
✅ "Using TEST ad units" (en dev)
✅ "Interstitial ad loaded"
✅ "Rewarded ad loaded"
✅ "Banner ad loaded"

⚠️ "Cannot show interstitial: too early in session"
⚠️ "Cannot show interstitial: wait Xs"
⚠️ "Interstitial shown (X/3 in session)"
```

### Statistiques de session
```typescript
const stats = adManager.getSessionStats();
console.log(stats);
// {
//   adsShown: 2,
//   maxAds: 3,
//   canShowMore: true,
//   sessionAge: 450000 // ms
// }
```

## 🚫 Politique Anti-Spam

### Rate Limiting Automatique
- ✅ Minimum 3 minutes entre interstitiels
- ✅ Premier interstitiel après 2 minutes
- ✅ Maximum 3 pubs par session de 10 minutes
- ✅ Session reset automatique après 10 minutes d'inactivité

### UX Respectueuse
- ✅ Bannières ne cachent jamais le contenu
- ✅ Interstitiels aux transitions naturelles seulement
- ✅ Vidéos récompensées optionnelles et clairement identifiées
- ✅ Aucune pub pendant le gameplay

## 🔐 Conformité Policies AdMob

### Respect des règles
- ✅ Contenu classé PG (max rating)
- ✅ Pas de pubs pour enfants (tagForChildDirectedTreatment: false)
- ✅ Pas de clics accidentels (boutons bien espacés)
- ✅ Transparence (l'utilisateur sait quand une pub va s'afficher)

### Protection de l'utilisateur
- ✅ Gestion des erreurs (pas de crash si pub échoue)
- ✅ Chargement en background (pas de freeze)
- ✅ Logs clairs pour debugging

## 💰 Optimisation des Revenus

### Best Practices Implémentées
1. **Préchargement**: Interstitiels et rewarded chargés à l'avance
2. **Taille adaptative**: Bannières s'adaptent à tous les écrans
3. **Placement intelligent**: Transitions naturelles seulement
4. **Récompenses attrayantes**: Incite à regarder les vidéos
5. **Session tracking**: Empêche la saturation

### À venir (optionnel)
- [ ] Mode Premium sans pub (in-app purchase)
- [ ] A/B testing des placements
- [ ] Analytics personnalisées
- [ ] Médiation avec autres réseaux

## 🐛 Résolution de Problèmes

### Pub ne s'affiche pas
1. Vérifier les logs: "ad loaded" ?
2. Vérifier le timing (rate limiting)
3. Tester avec les test IDs d'abord
4. Vérifier la connexion internet

### Crash au chargement
1. Vérifier AndroidManifest.xml (metadata AdMob)
2. Vérifier app.json (plugin configuré)
3. Rebuild après npm install
4. Vérifier les permissions

### Test IDs en production
⚠️ NE JAMAIS déployer avec `USE_TEST_ADS = true`

Vérifier dans `adManager.ts`:
```typescript
const USE_TEST_ADS = __DEV__; // Doit être lié à __DEV__
```

## 📱 Prêt pour Production

### Checklist avant publication
- [ ] Tester tous les formats de pub sur device réel
- [ ] Vérifier que USE_TEST_ADS = false en production
- [ ] Tester le rate limiting (3 min entre pubs)
- [ ] Vérifier que les bannières ne cachent rien
- [ ] Tester les vidéos récompensées
- [ ] Vérifier les logs (pas d'erreurs)
- [ ] Tester sur différentes tailles d'écran
- [ ] Vérifier les safe areas (notch, etc.)

### Configuration AdMob Console
1. Activer l'application dans AdMob
2. Vérifier les ad units créés
3. Configurer la médiation (optionnel)
4. Activer les rapports
5. Configurer le paiement

---

**Note**: Ce guide évoluera avec les tests et l'optimisation.
