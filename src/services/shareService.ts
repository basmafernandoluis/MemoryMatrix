/**
 * Share Service - Phase 13: Social Features
 * 
 * Gère le partage de scores sur les réseaux sociaux :
 * - Génération de texte de partage
 * - Partage natif (Share API)
 * - Liens vers l'application
 */

import { Share, Platform } from 'react-native';
import { ShareOptions, ShareResult, GameMode } from '../types';

class ShareService {
  private readonly APP_URL = 'https://play.google.com/store/apps/details?id=com.appwizards.MemoryMatrix';
  private readonly APP_NAME = 'Memory Matrix';

  /**
   * Générer le message de partage
   */
  private generateShareMessage(options: ShareOptions): string {
    const { score, level, mode, rank, isNewRecord } = options;

    let message = `🎮 ${this.APP_NAME}\n\n`;

    if (isNewRecord) {
      message += `🏆 NOUVEAU RECORD ! 🏆\n\n`;
    }

    // Message spécifique au mode
    switch (mode) {
      case 'classic':
        message += `Mode Classique 🎯\n`;
        message += `Score: ${score} points\n`;
        message += `Niveau: ${level}\n`;
        break;

      case 'survival':
        message += `Mode Survie 💪\n`;
        message += `Série de ${level} niveaux réussis !\n`;
        message += `Score: ${score} points\n`;
        break;

      case 'timeAttack':
        message += `Contre-la-montre ⚡\n`;
        message += `Score: ${score} points\n`;
        message += `Niveau: ${level}\n`;
        break;

      case 'zen':
        message += `Mode Zen 🧘\n`;
        message += `Précision: ${score}%\n`;
        message += `Niveau: ${level}\n`;
        break;

      case 'custom':
        message += `Mode Personnalisé 🎨\n`;
        message += `Score: ${score} points\n`;
        message += `Niveau: ${level}\n`;
        break;
    }

    if (rank) {
      message += `\n🏅 Classement: #${rank}\n`;
    }

    message += `\nPeux-tu battre mon score ? 🔥\n`;
    message += `Télécharge ${this.APP_NAME} !\n\n`;
    message += this.APP_URL;

    return message;
  }

  /**
   * Partager le score via Share API natif
   */
  async shareScore(options: ShareOptions): Promise<ShareResult> {
    try {
      const message = this.generateShareMessage(options);

      const result = await Share.share(
        {
          message,
          title: `Mon score sur ${this.APP_NAME}`,
          url: this.APP_URL, // iOS seulement
        },
        {
          dialogTitle: 'Partager mon score', // Android seulement
          subject: `Mon score sur ${this.APP_NAME}`, // Email seulement
        }
      );

      if (result.action === Share.sharedAction) {
        // Partagé avec succès
        return {
          success: true,
          platform: this.detectPlatform(result.activityType),
        };
      } else if (result.action === Share.dismissedAction) {
        // Annulé
        return {
          success: false,
          error: 'Partage annulé',
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Error sharing score:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du partage',
      };
    }
  }

  /**
   * Partager un défi avec un ami
   */
  async shareChallenge(
    friendName: string,
    mode: GameMode,
    targetScore?: number
  ): Promise<ShareResult> {
    try {
      let message = `🎮 ${this.APP_NAME}\n\n`;
      message += `Je te défie, ${friendName} ! 🔥\n\n`;

      switch (mode) {
        case 'classic':
          message += `Mode: Classique 🎯\n`;
          break;
        case 'survival':
          message += `Mode: Survie 💪\n`;
          break;
        case 'timeAttack':
          message += `Mode: Contre-la-montre ⚡\n`;
          break;
        case 'zen':
          message += `Mode: Zen 🧘\n`;
          break;
        case 'custom':
          message += `Mode: Personnalisé 🎨\n`;
          break;
      }

      if (targetScore) {
        message += `Score à battre: ${targetScore} points\n`;
      }

      message += `\nRelève le défi !\n\n`;
      message += this.APP_URL;

      const result = await Share.share(
        {
          message,
          title: 'Défi Memory Matrix',
          url: this.APP_URL,
        },
        {
          dialogTitle: 'Partager le défi',
          subject: 'Défi Memory Matrix',
        }
      );

      if (result.action === Share.sharedAction) {
        return {
          success: true,
          platform: this.detectPlatform(result.activityType),
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Error sharing challenge:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du partage',
      };
    }
  }

  /**
   * Partager l'application
   */
  async shareApp(): Promise<ShareResult> {
    try {
      const message = 
        `🎮 Découvre ${this.APP_NAME} !\n\n` +
        `Un jeu de mémoire addictif avec plusieurs modes de jeu :\n` +
        `🎯 Classique\n` +
        `💪 Survie\n` +
        `⚡ Contre-la-montre\n` +
        `🧘 Zen\n\n` +
        `Télécharge-le maintenant et défie tes amis !\n\n` +
        this.APP_URL;

      const result = await Share.share(
        {
          message,
          title: `${this.APP_NAME} - Jeu de Mémoire`,
          url: this.APP_URL,
        },
        {
          dialogTitle: 'Partager l\'application',
          subject: `${this.APP_NAME} - Jeu de Mémoire`,
        }
      );

      if (result.action === Share.sharedAction) {
        return {
          success: true,
          platform: this.detectPlatform(result.activityType),
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Error sharing app:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du partage',
      };
    }
  }

  /**
   * Générer un message de victoire pour un défi
   */
  async shareChallengeVictory(
    friendName: string,
    mode: GameMode,
    myScore: number,
    friendScore: number
  ): Promise<ShareResult> {
    try {
      let message = `🎮 ${this.APP_NAME}\n\n`;
      message += `🏆 J'ai gagné le défi contre ${friendName} ! 🏆\n\n`;

      switch (mode) {
        case 'classic':
          message += `Mode: Classique 🎯\n`;
          break;
        case 'survival':
          message += `Mode: Survie 💪\n`;
          break;
        case 'timeAttack':
          message += `Mode: Contre-la-montre ⚡\n`;
          break;
        case 'zen':
          message += `Mode: Zen 🧘\n`;
          break;
        case 'custom':
          message += `Mode: Personnalisé 🎨\n`;
          break;
      }

      message += `Mon score: ${myScore}\n`;
      message += `Score de ${friendName}: ${friendScore}\n\n`;
      message += `Peux-tu nous battre ? 🔥\n\n`;
      message += this.APP_URL;

      const result = await Share.share(
        {
          message,
          title: 'Victoire !',
          url: this.APP_URL,
        },
        {
          dialogTitle: 'Partager ma victoire',
          subject: 'Victoire sur Memory Matrix',
        }
      );

      if (result.action === Share.sharedAction) {
        return {
          success: true,
          platform: this.detectPlatform(result.activityType),
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Error sharing challenge victory:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du partage',
      };
    }
  }

  /**
   * Détecter la plateforme de partage
   */
  private detectPlatform(activityType?: string | null): ShareResult['platform'] {
    if (!activityType) return 'other';

    const type = activityType.toLowerCase();

    if (type.includes('facebook')) return 'facebook';
    if (type.includes('twitter')) return 'twitter';
    if (type.includes('instagram')) return 'instagram';
    if (type.includes('whatsapp')) return 'whatsapp';

    return 'other';
  }

  /**
   * Générer un lien de partage pour un mode spécifique
   */
  getShareLink(mode?: GameMode): string {
    if (!mode) return this.APP_URL;
    return `${this.APP_URL}&mode=${mode}`;
  }

  /**
   * Copier le lien de l'app dans le presse-papiers
   */
  getAppUrl(): string {
    return this.APP_URL;
  }
}

export const shareService = new ShareService();
