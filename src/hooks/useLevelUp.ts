import { useState, useEffect, useRef } from 'react';
import { playCorrectSound } from '../utils/soundManager';

interface UseLevelUpReturn {
  showLevelUp: boolean;
  currentLevel: number;
  isAnimating: boolean; // Indique si l'animation est en cours
  triggerLevelUp: (newLevel: number) => void;
  handleLevelUpComplete: () => void;
}

/**
 * Hook pour gérer l'animation de level up
 * Détecte automatiquement les changements de niveau et déclenche l'animation
 * 
 * @param gameLevel - Le niveau actuel du jeu (optionnel pour auto-détection)
 * @returns Objet avec l'état de l'animation et les fonctions de contrôle
 */
export const useLevelUp = (gameLevel?: number): UseLevelUpReturn => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(gameLevel || 1);
  const previousLevel = useRef(gameLevel || 1);

  // Auto-détection des changements de niveau
  useEffect(() => {
    if (gameLevel !== undefined && gameLevel > previousLevel.current) {
      triggerLevelUp(gameLevel);
    }
    previousLevel.current = gameLevel || previousLevel.current;
  }, [gameLevel]);

  /**
   * Déclenche manuellement l'animation de level up
   * @param newLevel - Le nouveau niveau à afficher
   */
  const triggerLevelUp = (newLevel: number) => {
    setCurrentLevel(newLevel);
    setShowLevelUp(true);
    setIsAnimating(true);
    
    // Joue un son de succès
    playCorrectSound();
  };

  /**
   * Callback appelé quand l'animation est terminée
   */
  const handleLevelUpComplete = () => {
    setShowLevelUp(false);
    setIsAnimating(false);
  };

  return {
    showLevelUp,
    currentLevel,
    isAnimating,
    triggerLevelUp,
    handleLevelUpComplete,
  };
};
