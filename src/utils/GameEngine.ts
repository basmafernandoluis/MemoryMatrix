// Game Engine - Core logic for Memory Matrix Phase 1

import { GAME_CONFIG } from '../constants/gameConfig';

export class GameEngine {
  /**
   * Generate a random sequence based on current level
   */
  static generateSequence(level: number, gridSize: number = GAME_CONFIG.GRID_SIZE): number[] {
    const sequenceLength = GAME_CONFIG.SEQUENCE_BASE_LENGTH + 
                          (level - 1) * GAME_CONFIG.SEQUENCE_INCREMENT;
    const maxCellIndex = gridSize * gridSize;
    const sequence: number[] = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(Math.floor(Math.random() * maxCellIndex));
    }
    
    return sequence;
  }

  /**
   * Check if user sequence matches the original sequence
   */
  static validateSequence(userSequence: number[], correctSequence: number[]): boolean {
    if (userSequence.length !== correctSequence.length) return false;
    
    for (let i = 0; i < userSequence.length; i++) {
      if (userSequence[i] !== correctSequence[i]) return false;
    }
    
    return true;
  }

  /**
   * Calculate score for completing a level
   */
  static calculateLevelScore(level: number): number {
    return GAME_CONFIG.POINTS_PER_LEVEL * level + 
           (GAME_CONFIG.SEQUENCE_BASE_LENGTH + (level - 1)) * GAME_CONFIG.POINTS_PER_CORRECT_CELL;
  }

  /**
   * Check if partial user input is still correct
   */
  static isPartialSequenceCorrect(userSequence: number[], correctSequence: number[]): boolean {
    for (let i = 0; i < userSequence.length; i++) {
      if (userSequence[i] !== correctSequence[i]) return false;
    }
    return true;
  }

  /**
   * Convert cell index to row/col position
   */
  static indexToPosition(index: number, gridSize: number = GAME_CONFIG.GRID_SIZE): { row: number; col: number } {
    return {
      row: Math.floor(index / gridSize),
      col: index % gridSize,
    };
  }

  /**
   * Convert row/col position to cell index
   */
  static positionToIndex(row: number, col: number, gridSize: number = GAME_CONFIG.GRID_SIZE): number {
    return row * gridSize + col;
  }
}
