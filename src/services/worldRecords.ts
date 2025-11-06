/**
 * World Records Service
 * Gère les records mondiaux par mode de jeu
 */

import { firestore } from './firebase';
import { GameMode } from '../types';

export interface WorldRecord {
  mode: GameMode;
  value: number; // Score, streak, ou accuracy selon le mode
  playerName: string;
  playerId: string;
  timestamp: Date;
}

interface WorldRecordsCache {
  classic: WorldRecord | null;
  survival: WorldRecord | null;
  timeAttack: WorldRecord | null;
  zen: WorldRecord | null;
  custom: WorldRecord | null;
  focusChallenge: WorldRecord | null;
  lastUpdated: number;
}

// Cache local pour éviter trop de requêtes Firestore
let recordsCache: WorldRecordsCache = {
  classic: null,
  survival: null,
  timeAttack: null,
  zen: null,
  custom: null,
  focusChallenge: null,
  lastUpdated: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupérer le record mondial pour un mode spécifique
 */
export const getWorldRecordForMode = async (mode: GameMode): Promise<WorldRecord | null> => {
  try {
    // Vérifier le cache
    const now = Date.now();
    if (recordsCache[mode] && now - recordsCache.lastUpdated < CACHE_DURATION) {
      return recordsCache[mode];
    }

    // Déterminer le champ à trier selon le mode
    let orderByField = '';
    switch (mode) {
      case 'classic':
        orderByField = 'classicBest';
        break;
      case 'survival':
        orderByField = 'survivalBest';
        break;
      case 'timeAttack':
        orderByField = 'timeAttackBest';
        break;
      case 'zen':
        orderByField = 'zenBest';
        break;
      case 'custom':
        orderByField = 'globalScore';
        break;
      case 'focusChallenge':
        orderByField = 'focusChallengeBest';
        break;
    }

    // Requête Firestore pour le meilleur score
    const snapshot = await firestore()
      .collection('leaderboard')
      .orderBy(orderByField, 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    const record: WorldRecord = {
      mode,
      value: data[orderByField] || 0,
      playerName: data.displayName || 'Joueur Anonyme',
      playerId: data.userId,
      timestamp: data.timestamp?.toDate() || new Date(),
    };

    // Mettre à jour le cache
    recordsCache[mode] = record;
    recordsCache.lastUpdated = now;

    return record;
  } catch (error) {
    console.error(`Error fetching world record for ${mode}:`, error);
    return null;
  }
};

/**
 * Récupérer tous les records mondiaux d'un coup
 */
export const getAllWorldRecords = async (): Promise<WorldRecordsCache> => {
  try {
    const modes: GameMode[] = ['classic', 'survival', 'timeAttack', 'zen', 'custom'];
    
    const records = await Promise.all(
      modes.map(mode => getWorldRecordForMode(mode))
    );

    const cache: WorldRecordsCache = {
      classic: records[0],
      survival: records[1],
      timeAttack: records[2],
      zen: records[3],
      custom: records[4],
      focusChallenge: records[5] || null,
      lastUpdated: Date.now(),
    };

    recordsCache = cache;
    return cache;
  } catch (error) {
    console.error('Error fetching all world records:', error);
    return recordsCache;
  }
};

/**
 * Écouter les mises à jour du record mondial en temps réel
 */
export const subscribeToWorldRecord = (
  mode: GameMode,
  callback: (record: WorldRecord | null) => void
): (() => void) => {
  try {
    let orderByField = '';
    switch (mode) {
      case 'classic':
        orderByField = 'classicBest';
        break;
      case 'survival':
        orderByField = 'survivalBest';
        break;
      case 'timeAttack':
        orderByField = 'timeAttackBest';
        break;
      case 'zen':
        orderByField = 'zenBest';
        break;
      case 'custom':
        orderByField = 'globalScore';
        break;
      case 'focusChallenge':
        orderByField = 'focusChallengeBest';
        break;
    }

    const unsubscribe = firestore()
      .collection('leaderboard')
      .orderBy(orderByField, 'desc')
      .limit(1)
      .onSnapshot((snapshot: any) => {
        if (snapshot.empty) {
          callback(null);
          return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        const record: WorldRecord = {
          mode,
          value: data[orderByField] || 0,
          playerName: data.displayName || 'Joueur Anonyme',
          playerId: data.userId,
          timestamp: data.timestamp?.toDate() || new Date(),
        };

        // Mettre à jour le cache
        recordsCache[mode] = record;
        recordsCache.lastUpdated = Date.now();

        callback(record);
      }, (error: any) => {
        console.error(`Error subscribing to world record for ${mode}:`, error);
        callback(null);
      });

    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up subscription for ${mode}:`, error);
    return () => {};
  }
};

/**
 * Obtenir le record personnel du joueur pour un mode
 */
export const getPersonalBestForMode = (
  mode: GameMode,
  userProgress: any
): number => {
  if (!userProgress) return 0;

  switch (mode) {
    case 'classic':
      return userProgress.highScore || 0;
    case 'survival':
      return userProgress.survivalBestStreak || 0;
    case 'timeAttack':
      return userProgress.timeAttackBestScore || 0;
    case 'zen':
      return userProgress.zenBestAccuracy || 0;
    case 'custom':
      return userProgress.highScore || 0;
    case 'focusChallenge':
      return userProgress.focusChallengeBest || 0;
    default:
      return 0;
  }
};

/**
 * Formater le record selon le mode
 */
export const formatRecord = (mode: GameMode, value: number): string => {
  switch (mode) {
    case 'zen':
      return `${value.toFixed(1)}%`; // Précision en %
    case 'survival':
      return `${value} niveaux`; // Streak
    case 'focusChallenge':
      return `${value} pts 🎯`;
    default:
      return `${value} pts`; // Score
  }
};

/**
 * Obtenir le label du record selon le mode
 */
export const getRecordLabel = (mode: GameMode): string => {
  switch (mode) {
    case 'classic':
      return 'Meilleur Score';
    case 'survival':
      return 'Meilleur Streak';
    case 'timeAttack':
      return 'Meilleur Score';
    case 'zen':
      return 'Meilleure Précision';
    case 'custom':
      return 'Meilleur Score';
    case 'focusChallenge':
      return 'Meilleur Focus Score';
    default:
      return 'Record';
  }
};

/**
 * Vider le cache (utile pour forcer le rafraîchissement)
 */
export const clearRecordsCache = (): void => {
  recordsCache = {
    classic: null,
    survival: null,
    timeAttack: null,
    zen: null,
    custom: null,
    focusChallenge: null,
    lastUpdated: 0,
  };
};
