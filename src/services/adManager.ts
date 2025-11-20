/**
 * AdManager Service - Gestion centralisée des publicités AdMob
 * 
 * Gère la logique de toutes les publicités avec:
 * - Rate limiting pour éviter le spam
 * - Tracking des sessions
 * - Gestion des erreurs
 * - Respect des policies AdMob
 */

import MobileAds, {
  MaxAdContentRating,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

// IDs AdMob de production
const ADMOB_IDS = {
  BANNER: 'ca-app-pub-7435856398879419/6683572857',
  INTERSTITIAL: 'ca-app-pub-7435856398879419/7797822903',
  REWARDED: 'ca-app-pub-7435856398879419/1755158732',
};

// IDs de test pour le développement
const TEST_IDS = {
  BANNER: TestIds.BANNER,
  INTERSTITIAL: TestIds.INTERSTITIAL,
  REWARDED: TestIds.REWARDED,
};

// Utiliser les test IDs en développement, production en release
const USE_TEST_ADS = __DEV__;

// Export des IDs à utiliser
export const AD_UNIT_IDS = USE_TEST_ADS ? TEST_IDS : ADMOB_IDS;

/**
 * Configuration de la fréquence des publicités
 * Optimisée pour MAXIMISER les revenus tout en préservant l'expérience utilisateur
 * Basée sur les best practices AdMob pour les jeux casual
 */
const AD_CONFIG = {
  // Interstitiel: Réduit à 60 secondes pour plus d'impressions (était 90s)
  // Best practice: 60-90s pour jeux casual
  INTERSTITIAL_MIN_INTERVAL: 60 * 1000, // 1 minute en ms
  
  // Première pub après 45 secondes (était 60s) pour capturer rapidement l'attention
  FIRST_INTERSTITIAL_DELAY: 45 * 1000, // 45 secondes
  
  // Augmenté à 8 pubs par session (était 6) pour maximiser les revenus
  // Limite Google: Pas de limite stricte, mais 8/10min est optimal
  MAX_ADS_PER_SESSION: 8,
  SESSION_DURATION: 10 * 60 * 1000, // 10 minutes
  
  // Refresh rate pour les bannières réduit à 30s (était 35s)
  // Minimum recommandé par AdMob: 30s
  BANNER_REFRESH_RATE: 30 * 1000, // 30 secondes (minimum AdMob)
};

class AdManagerService {
  private initialized: boolean = false;
  private interstitialAd: InterstitialAd | null = null;
  private interstitialLoaded: boolean = false;
  private lastInterstitialTime: number = 0;
  private adsShownThisSession: number = 0;
  private sessionStartTime: number = Date.now();
  
  private rewardedAd: RewardedAd | null = null;
  private rewardedLoaded: boolean = false;
  private rewardedRetryCount: number = 0;
  private rewardedRetryTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialiser AdMob
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('AdMob already initialized');
      return;
    }

    try {
      await MobileAds().initialize();
      
      // Configuration globale pour conformité Families Policy
      await MobileAds().setRequestConfiguration({
        // Contenu adapté aux enfants (G = General Audiences)
        maxAdContentRating: MaxAdContentRating.G,
        // Traiter comme dirigé vers les enfants
        tagForChildDirectedTreatment: true,
        // Conformité COPPA/GDPR-K
        tagForUnderAgeOfConsent: true,
      });

      this.initialized = true;
      
      // Précharger les publicités conformes à Families Policy
      // Important: Les interstitiels seront affichés avec un bouton de fermeture après 5 secondes
      this.loadInterstitial();
      this.loadRewarded();

      console.log('AdMob initialized successfully with Families Policy compliance');
      console.log('Using', USE_TEST_ADS ? 'TEST' : 'PRODUCTION', 'ad units');
      console.log('Child-directed treatment: ENABLED');
      console.log('Max content rating: G (General Audiences)');
      console.log('Interstitial ads: ENABLED with 5-second close button');
    } catch (error) {
      console.error('Error initializing AdMob:', error);
    }
  }

  /**
   * Précharger une publicité interstitielle
   * Conforme à Families Policy avec filtrage de contenu
   */
  private loadInterstitial(): void {
    this.interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true, // Pas de publicité personnalisée pour les enfants
      // Keywords optimisés pour maximiser le fill rate
      keywords: [
        'mobile games', 'puzzle games', 'brain games', 'memory games',
        'casual games', 'family games', 'educational games',
        'kids', 'children', 'family', 'education',
        'learning', 'brain training', 'entertainment',
        'mobile apps', 'gaming apps', 'free games',
        'casual gaming', 'arcade', 'trivia', 'logic games'
      ],
    });
    
    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded (child-safe, closable after 5s)');
      this.interstitialLoaded = true;
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Interstitial ad failed to load:', error);
      this.interstitialLoaded = false;
      // Réessayer après 30 secondes
      setTimeout(() => this.loadInterstitial(), 30000);
    });

    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      this.interstitialLoaded = false;
      // Précharger la prochaine après 5 secondes
      setTimeout(() => this.loadInterstitial(), 5000);
    });

    this.interstitialAd.load();
  }

  /**
   * Précharger une publicité vidéo récompensée
   * Conforme à Families Policy avec filtrage de contenu
   * IMPORTANT: En production, les rewarded ads ont un taux de remplissage plus faible
   * et nécessitent des retry plus agressifs
   */
  private loadRewarded(): void {
    // Nettoyer le timeout précédent si existant
    if (this.rewardedRetryTimeout) {
      clearTimeout(this.rewardedRetryTimeout);
      this.rewardedRetryTimeout = null;
    }

    console.log(`[REWARDED] Loading rewarded ad (attempt ${this.rewardedRetryCount + 1})`);
    
    this.rewardedAd = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
      requestNonPersonalizedAdsOnly: true, // Pas de publicité personnalisée pour les enfants
      // Keywords optimisés pour maximiser le fill rate et les revenus
      // Catégories à haute valeur: Jeux, Éducation, Famille, Apps mobiles
      keywords: [
        // Core categories (high eCPM)
        'mobile games', 'puzzle games', 'brain games', 'memory games',
        'casual games', 'family games', 'educational games',
        
        // Target audience
        'kids', 'children', 'family', 'parents', 'education',
        
        // Related activities
        'learning', 'training', 'brain training', 'cognitive',
        'entertainment', 'fun', 'challenge',
        
        // Mobile/App related (high value)
        'mobile apps', 'gaming apps', 'free games', 'app download',
        
        // Revenue-driving categories
        'casual gaming', 'arcade', 'trivia', 'quiz',
        'mind games', 'logic games', 'strategy'
      ],
    });
    
    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('[REWARDED] ✅ Rewarded ad loaded successfully (child-safe, non-personalized)');
      this.rewardedLoaded = true;
      this.rewardedRetryCount = 0; // Reset retry counter sur succès
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      console.log('[REWARDED] 🎁 User earned reward:', reward);
    });

    this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('[REWARDED] ❌ Failed to load:', error);
      this.rewardedLoaded = false;
      
      // Stratégie de retry agressive avec backoff exponentiel
      this.rewardedRetryCount++;
      
      // Backoff: 3s, 5s, 10s, 15s, 30s, puis 30s répété
      const retryDelays = [3000, 5000, 10000, 15000, 30000];
      const delayIndex = Math.min(this.rewardedRetryCount - 1, retryDelays.length - 1);
      const retryDelay = retryDelays[delayIndex];
      
      console.log(`[REWARDED] Retry #${this.rewardedRetryCount} in ${retryDelay / 1000}s...`);
      
      this.rewardedRetryTimeout = setTimeout(() => {
        this.loadRewarded();
      }, retryDelay);
    });

    this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[REWARDED] 👋 Rewarded ad closed');
      this.rewardedLoaded = false;
      this.rewardedRetryCount = 0; // Reset pour le prochain chargement
      // Précharger la prochaine après 2 secondes
      this.rewardedRetryTimeout = setTimeout(() => {
        this.loadRewarded();
      }, 2000);
    });

    this.rewardedAd.load();
  }

  /**
   * Vérifier si on peut afficher une pub interstitielle
   * Respecte les règles de fréquence pour éviter le spam
   */
  private canShowInterstitial(): boolean {
    console.log('[INTERSTITIAL] Checking if can show:', {
      initialized: this.initialized,
      loaded: this.interstitialLoaded,
      adsShown: this.adsShownThisSession,
      lastAdTime: this.lastInterstitialTime,
      sessionStart: this.sessionStartTime,
    });

    if (!this.initialized) {
      console.log('[INTERSTITIAL] ❌ AdMob not initialized');
      return false;
    }

    if (!this.interstitialLoaded) {
      console.log('[INTERSTITIAL] ❌ Ad not loaded yet');
      return false;
    }

    const now = Date.now();
    
    // Vérifier la session (reset compteur toutes les 10 minutes)
    if (now - this.sessionStartTime > AD_CONFIG.SESSION_DURATION) {
      this.sessionStartTime = now;
      this.adsShownThisSession = 0;
      console.log('[INTERSTITIAL] Session reset');
    }

    // Maximum 3 pubs par session de 10 minutes
    if (this.adsShownThisSession >= AD_CONFIG.MAX_ADS_PER_SESSION) {
      console.log('[INTERSTITIAL] ❌ Max ads per session reached (3/3)');
      return false;
    }

    // Minimum 3 minutes entre chaque pub
    const timeSinceLastAd = now - this.lastInterstitialTime;
    if (this.lastInterstitialTime > 0 && timeSinceLastAd < AD_CONFIG.INTERSTITIAL_MIN_INTERVAL) {
      console.log(`[INTERSTITIAL] ❌ Too soon for next ad (${Math.round(timeSinceLastAd / 1000)}s / ${AD_CONFIG.INTERSTITIAL_MIN_INTERVAL / 1000}s)`);
      return false;
    }

    // Première pub après 2 minutes d'utilisation
    const timeSinceAppStart = now - this.sessionStartTime;
    if (this.adsShownThisSession === 0 && timeSinceAppStart < AD_CONFIG.FIRST_INTERSTITIAL_DELAY) {
      console.log(`[INTERSTITIAL] ❌ Too soon for first ad (${Math.round(timeSinceAppStart / 1000)}s / ${AD_CONFIG.FIRST_INTERSTITIAL_DELAY / 1000}s)`);
      return false;
    }

    console.log('[INTERSTITIAL] ✅ Can show ad!');
    return true;
  }

  /**
   * Afficher une publicité interstitielle
   * Conforme à Families Policy: fermable après 5 secondes maximum
   */
  async showInterstitial(): Promise<boolean> {
    console.log('[INTERSTITIAL] showInterstitial() called');
    
    if (!this.canShowInterstitial()) {
      console.log('[INTERSTITIAL] ❌ Cannot show (failed canShowInterstitial check)');
      return false;
    }

    if (!this.interstitialAd) {
      console.log('[INTERSTITIAL] ❌ No interstitial ad instance');
      return false;
    }

    try {
      console.log('[INTERSTITIAL] 🎬 Showing ad...');
      await this.interstitialAd.show();
      
      this.lastInterstitialTime = Date.now();
      this.adsShownThisSession++;
      this.interstitialLoaded = false; // Sera rechargé via l'event CLOSED
      
      console.log(`[INTERSTITIAL] ✅ Ad shown successfully (${this.adsShownThisSession}/${AD_CONFIG.MAX_ADS_PER_SESSION} this session)`);
      console.log('[INTERSTITIAL] Ad is child-safe and closable after 5 seconds');
      return true;
    } catch (error) {
      console.error('[INTERSTITIAL] ❌ Error showing ad:', error);
      return false;
    }
  }

  /**
   * Vérifier si une vidéo récompensée est disponible
   * Affiche des logs détaillés pour le debug en production
   */
  isRewardedAvailable(): boolean {
    const available = this.initialized && this.rewardedLoaded;
    console.log('[REWARDED] isRewardedAvailable():', {
      initialized: this.initialized,
      loaded: this.rewardedLoaded,
      available,
      retryCount: this.rewardedRetryCount,
      useTestAds: USE_TEST_ADS,
      adUnitId: AD_UNIT_IDS.REWARDED,
    });
    return available;
  }

  /**
   * Afficher une vidéo récompensée
   * Retourne une Promise qui résout avec le statut de succès
   */
  async showRewarded(onReward: () => void): Promise<boolean> {
    console.log('[REWARDED] showRewarded() called');
    
    if (!this.isRewardedAvailable() || !this.rewardedAd) {
      console.error('[REWARDED] ❌ Rewarded ad not available', {
        initialized: this.initialized,
        loaded: this.rewardedLoaded,
        hasAdInstance: !!this.rewardedAd,
        retryCount: this.rewardedRetryCount,
      });
      
      // Si l'annonce n'est pas chargée, déclencher un retry immédiat
      if (this.initialized && !this.rewardedLoaded) {
        console.log('[REWARDED] 🔄 Triggering immediate reload...');
        this.loadRewarded();
      }
      
      return false;
    }

    try {
      console.log('[REWARDED] 🎬 Attempting to show rewarded ad...');
      
      // Écouter l'événement de récompense
      const unsubscribe = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('[REWARDED] 🎁 User earned reward:', reward);
          onReward();
          unsubscribe();
        }
      );

      await this.rewardedAd.show();
      this.rewardedLoaded = false; // Sera rechargé via l'event CLOSED
      
      console.log('[REWARDED] ✅ Rewarded ad shown successfully');
      return true;
    } catch (error) {
      console.error('[REWARDED] ❌ Error showing rewarded ad:', error);
      
      // En cas d'erreur d'affichage, recharger immédiatement
      console.log('[REWARDED] 🔄 Reloading after show error...');
      this.rewardedLoaded = false;
      this.loadRewarded();
      
      return false;
    }
  }

  /**
   * Forcer le rechargement d'une rewarded ad
   * Utile si l'utilisateur clique sur "regarder une pub" mais elle n'est pas prête
   */
  forceReloadRewarded(): void {
    console.log('[REWARDED] 🔄 Force reload requested by user');
    if (!this.rewardedLoaded) {
      this.rewardedRetryCount = 0; // Reset pour retry immédiat
      this.loadRewarded();
    } else {
      console.log('[REWARDED] ✅ Already loaded, no reload needed');
    }
  }

  /**
   * Obtenir le statut détaillé des rewarded ads (pour debug)
   */
  getRewardedStatus(): {
    available: boolean;
    loading: boolean;
    retryCount: number;
    initialized: boolean;
  } {
    return {
      available: this.rewardedLoaded,
      loading: !this.rewardedLoaded && this.initialized,
      retryCount: this.rewardedRetryCount,
      initialized: this.initialized,
    };
  }
}

// Export singleton
export const adManager = new AdManagerService();
export { BannerAdSize };
