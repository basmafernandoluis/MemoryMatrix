/**
 * Hook pour gérer les records mondiaux en temps réel
 */

import { useState, useEffect } from 'react';
import { GameMode, UserProgress } from '../types';
import {
  WorldRecord,
  getWorldRecordForMode,
  subscribeToWorldRecord,
  getPersonalBestForMode,
} from '../services/worldRecords';

interface RecordsData {
  personalBest: number;
  worldRecord: WorldRecord | null;
  isWorldRecordHolder: boolean;
  isNearWorldRecord: boolean; // Si à moins de 10% du record mondial
  percentageOfWorld: number; // % du record mondial atteint
}

export const useWorldRecords = (
  mode: GameMode,
  userProgress: UserProgress | null,
  currentValue: number = 0, // Score/streak/accuracy actuel dans la partie en cours
  userId?: string // ID du joueur pour vérifier s'il détient le record
): RecordsData => {
  const [worldRecord, setWorldRecord] = useState<WorldRecord | null>(null);
  const [personalBest, setPersonalBest] = useState<number>(0);

  // Récupérer le record personnel
  useEffect(() => {
    if (userProgress) {
      const pb = getPersonalBestForMode(mode, userProgress);
      setPersonalBest(pb);
    }
  }, [mode, userProgress]);

  // S'abonner au record mondial en temps réel
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupSubscription = async () => {
      // Charger le record initial
      const initialRecord = await getWorldRecordForMode(mode);
      setWorldRecord(initialRecord);

      // S'abonner aux mises à jour en temps réel
      unsubscribe = subscribeToWorldRecord(mode, (record) => {
        setWorldRecord(record);
      });
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [mode]);

  // Calculer si le joueur détient le record mondial
  const isWorldRecordHolder = worldRecord && userId
    ? worldRecord.playerId === userId
    : false;

  // Calculer la proximité avec le record mondial
  const worldRecordValue = worldRecord?.value || 0;
  const bestValue = Math.max(personalBest, currentValue);
  
  const percentageOfWorld = worldRecordValue > 0 
    ? (bestValue / worldRecordValue) * 100 
    : 0;

  const isNearWorldRecord = percentageOfWorld >= 90 && percentageOfWorld < 100;

  return {
    personalBest,
    worldRecord,
    isWorldRecordHolder,
    isNearWorldRecord,
    percentageOfWorld,
  };
};
