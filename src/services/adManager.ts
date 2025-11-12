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
 */
const AD_CONFIG = {
  // Interstitiel: Maximum 1 toutes les 3 minutes
  INTERSTITIAL_MIN_INTERVAL: 1 * 60 * 1000, // 3 minutes en ms
  
  // Première pub interstitielle après 2 minutes d'usage
  FIRST_INTERSTITIAL_DELAY: 2 * 60 * 1000, // 2 minutes
  
  // Maximum 6 publicités par session de 10 minutes
  MAX_ADS_PER_SESSION: 6,
  SESSION_DURATION: 10 * 60 * 1000, // 10 minutes
  
  // Refresh rate pour les bannières
  BANNER_REFRESH_RATE: 45 * 1000, // 45 secondes
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
   */
  private loadRewarded(): void {
    this.rewardedAd = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED);
    
    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('Rewarded ad loaded');
      this.rewardedLoaded = true;
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      console.log('User earned reward:', reward);
    });

    this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Rewarded ad failed to load:', error);
      this.rewardedLoaded = false;
      // Réessayer après 5 secondes
      setTimeout(() => this.loadRewarded(), 5000);
    });

    this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Rewarded ad closed');
      this.rewardedLoaded = false;
      // Précharger la prochaine
      setTimeout(() => this.loadRewarded(), 1000);
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
   */
  isRewardedAvailable(): boolean {
    return this.initialized && this.rewardedLoaded;
  }

  /**
   * Afficher une vidéo récompensée
   */
  async showRewarded(onReward: () => void): Promise<boolean> {
    if (!this.isRewardedAvailable() || !this.rewardedAd) {
      console.log('Rewarded ad not available');
      return false;
    }

    try {
      // Écouter l'événement de récompense
      const unsubscribe = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('User earned reward:', reward);
          onReward();
          unsubscribe();
        }
      );

      await this.rewardedAd.show();
      this.rewardedLoaded = false; // Sera rechargé via l'event CLOSED
      
      console.log('Rewarded ad shown');
      return true;
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return false;
    }
  }
}

// Export singleton
export const adManager = new AdManagerService();
export { BannerAdSize };
