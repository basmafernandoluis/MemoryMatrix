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
  INTERSTITIAL_MIN_INTERVAL: 3 * 60 * 1000, // 3 minutes en ms
  
  // Première pub interstitielle après 2 minutes d'usage
  FIRST_INTERSTITIAL_DELAY: 2 * 60 * 1000, // 2 minutes
  
  // Maximum 3 publicités par session de 10 minutes
  MAX_ADS_PER_SESSION: 3,
  SESSION_DURATION: 10 * 60 * 1000, // 10 minutes
  
  // Refresh rate pour les bannières
  BANNER_REFRESH_RATE: 45 * 1000, // 45 secondes
};

class AdManagerService {
  private initialized: boolean = false;
  private interstitialAd: InterstitialAd | null = null;
  private rewardedAd: RewardedAd | null = null;
  private interstitialLoaded: boolean = false;
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
      
      // Configuration globale
      await MobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });

      this.initialized = true;
      
      // Précharger les interstitiels et rewarded ads
      this.loadInterstitial();
      this.loadRewarded();

      console.log('AdMob initialized successfully');
      console.log('Using', USE_TEST_ADS ? 'TEST' : 'PRODUCTION', 'ad units');
    } catch (error) {
      console.error('Error initializing AdMob:', error);
    }
  }

  /**
   * Précharger une publicité interstitielle
   */
  private loadInterstitial(): void {
    this.interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL);
    
    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
      this.interstitialLoaded = true;
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Interstitial ad failed to load:', error);
      this.interstitialLoaded = false;
    });

    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      this.interstitialLoaded = false;
      // Précharger la prochaine
      setTimeout(() => this.loadInterstitial(), 1000);
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
   * Afficher une publicité interstitielle
   * Rate limiting géré par AdMob console
   */
  async showInterstitial(): Promise<boolean> {
    if (!this.initialized || !this.interstitialLoaded || !this.interstitialAd) {
      console.log('Cannot show interstitial: not ready');
      return false;
    }

    try {
      await this.interstitialAd.show();
      console.log('Interstitial shown');
      return true;
    } catch (error) {
      console.error('Error showing interstitial:', error);
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
