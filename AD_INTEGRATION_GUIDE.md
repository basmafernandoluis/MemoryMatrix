# 🎮 Guide Rapide - Nouvelles Fonctionnalités Ads

## 🆕 Nouvelles Méthodes API

### 1. Force Reload Rewarded Ad
```typescript
import { adManager } from './services/adManager';

// Dans votre composant UI, quand l'utilisateur clique sur "Regarder une pub"
const handleWatchAd = () => {
  if (!adManager.isRewardedAvailable()) {
    // Afficher message "Chargement en cours..."
    adManager.forceReloadRewarded();
    
    // Optionnel: Réessayer après 2-3 secondes
    setTimeout(() => {
      if (adManager.isRewardedAvailable()) {
        // Maintenant disponible!
        showRewardedAd();
      }
    }, 3000);
  } else {
    showRewardedAd();
  }
};
```

### 2. Status Monitoring (Pour UI)
```typescript
// Afficher l'état de chargement dans votre UI
const RewardedAdButton = () => {
  const [status, setStatus] = useState(adManager.getRewardedStatus());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(adManager.getRewardedStatus());
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <TouchableOpacity
      disabled={!status.available}
      onPress={handleWatchAd}
    >
      {status.available ? (
        <Text>🎁 Regarder une pub (+50 XP)</Text>
      ) : status.loading ? (
        <Text>⏳ Chargement... (tentative {status.retryCount})</Text>
      ) : (
        <Text>❌ Pub non disponible</Text>
      )}
    </TouchableOpacity>
  );
};
```

## 📊 Monitoring des Performances

### Logs à Surveiller
```bash
# Voir tous les logs rewarded ads
adb logcat | grep REWARDED

# Logs clés:
# ✅ [REWARDED] ✅ Rewarded ad loaded successfully
# 🔄 [REWARDED] Retry #X in Ys...
# 🎬 [REWARDED] 🎬 Attempting to show rewarded ad...
# 🎁 [REWARDED] 🎁 User earned reward
```

### Métriques à Tracker
```typescript
// Dans votre analytics/monitoring
const trackAdMetrics = () => {
  const status = adManager.getRewardedStatus();
  
  analytics.track('ad_status', {
    available: status.available,
    retryCount: status.retryCount,
    timestamp: Date.now()
  });
};
```

## 🎯 Best Practices d'Intégration

### Où Placer les Rewarded Ads?

#### ✅ Recommandé (High Conversion)
1. **Game Over Screen** - Continue game
2. **Après 3 victoires consécutives** - Bonus rewards
3. **Daily Challenges** - Extra rewards
4. **Unlock Premium Features** - Temporary access
5. **Shop** - Get coins/XP

#### ❌ À Éviter
1. ~~Pendant gameplay actif~~
2. ~~Toutes les 30 secondes~~
3. ~~Sans valeur claire pour l'utilisateur~~
4. ~~Avant que l'utilisateur soit engagé~~

### Exemple: GameOverScreen
```typescript
// GameOverScreen.tsx
import { adManager } from '../services/adManager';

const GameOverScreen = ({ score, onContinue, onQuit }) => {
  const [showContinueOption] = useState(score > 0);
  const [adStatus, setAdStatus] = useState(adManager.getRewardedStatus());
  
  // Update status every second
  useEffect(() => {
    const timer = setInterval(() => {
      setAdStatus(adManager.getRewardedStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handleContinueWithAd = async () => {
    if (!adStatus.available) {
      Alert.alert(
        'Publicité en chargement',
        'Veuillez patienter quelques secondes...'
      );
      adManager.forceReloadRewarded();
      return;
    }
    
    const shown = await adManager.showRewarded(() => {
      // Récompense accordée!
      onContinue();
    });
    
    if (!shown) {
      Alert.alert(
        'Erreur',
        'Impossible de charger la publicité. Réessayez dans un instant.'
      );
    }
  };
  
  return (
    <View>
      <Text>Game Over! Score: {score}</Text>
      
      {showContinueOption && (
        <TouchableOpacity
          style={[
            styles.continueButton,
            !adStatus.available && styles.buttonDisabled
          ]}
          onPress={handleContinueWithAd}
          disabled={!adStatus.available}
        >
          <Text style={styles.buttonText}>
            {adStatus.available
              ? '🎁 Continuer (Regarder pub)'
              : adStatus.loading
              ? `⏳ Chargement... (${adStatus.retryCount})`
              : '❌ Pub non disponible'}
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.quitButton} onPress={onQuit}>
        <Text>Menu Principal</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## 🔍 Debugging

### Test en DEV
```typescript
// Les test ads se chargent instantanément
console.log('Mode:', __DEV__ ? 'TEST ADS' : 'PRODUCTION ADS');

// Forcer un reload
adManager.forceReloadRewarded();

// Vérifier status
console.log(adManager.getRewardedStatus());
```

### Test en PROD
```bash
# 1. Build release
cd android && ./gradlew assembleRelease

# 2. Install
adb install app/build/outputs/apk/release/app-release.apk

# 3. Monitor logs
adb logcat | grep -E "REWARDED|AdMob"

# 4. Tester après 2-3 minutes
# (Les rewarded ads prennent plus de temps en prod)
```

## ⚡ Performance Tips

### Précharger Tôt
```typescript
// App.tsx
useEffect(() => {
  // Précharger dès que l'app démarre
  adManager.initialize();
}, []);
```

### Cache Multiple Ads
```typescript
// Pour des sessions longues, recharger proactivement
useEffect(() => {
  const interval = setInterval(() => {
    if (!adManager.isRewardedAvailable()) {
      adManager.forceReloadRewarded();
    }
  }, 60000); // Check every minute
  
  return () => clearInterval(interval);
}, []);
```

### Handle Errors Gracefully
```typescript
const showRewardedSafely = async (onReward: () => void) => {
  try {
    const shown = await adManager.showRewarded(onReward);
    if (!shown) {
      // Fallback: donner quand même la récompense?
      Alert.alert(
        'Pas de pub disponible',
        'Vous recevrez quand même votre récompense!',
        [{ text: 'OK', onPress: onReward }]
      );
    }
  } catch (error) {
    console.error('Ad error:', error);
    // Graceful degradation
    onReward();
  }
};
```

---

**Dernière mise à jour**: 19 Nov 2025  
**Version**: 2.0.0
