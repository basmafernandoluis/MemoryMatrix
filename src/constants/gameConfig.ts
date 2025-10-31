// Game configuration constants - Phase 1 MVP

export const GAME_CONFIG = {
  // Grid configuration
  GRID_SIZE: 4, // 4x4 grid (16 cells)
  
  // Game rules
  INITIAL_LIVES: 5, // ✅ 5 vies pour un jeu plus accessible
  INITIAL_LEVEL: 1,
  MAX_LEVEL: 30, // ⬆️ Increased from 10 to 30 for longer engagement
  
  // Scoring - Adjusted for better achievement progression
  POINTS_PER_LEVEL: 150, // ⬆️ Increased from 100 to 150
  POINTS_PER_CORRECT_CELL: 20, // ⬆️ Increased from 10 to 20
  
  // Timing (in milliseconds) - Slower for better accessibility
  CELL_HIGHLIGHT_DURATION: 700, // ⬆️ Increased from 500 to 700ms (easier to see)
  DELAY_BETWEEN_CELLS: 500, // ⬆️ Increased from 300 to 500ms (more time to memorize)
  FEEDBACK_DURATION: 800,
  
  // Difficulty progression - VERY GENTLE for wide audience
  SEQUENCE_BASE_LENGTH: 2, // ⬇️ Starting with 2 cells (super easy start)
  SEQUENCE_INCREMENT: 1, // Add 1 cell per level (but with plateaus)
  
  // Visual
  CELL_SIZE: 70,
  CELL_GAP: 10,
};

/**
 * Get sequence length for a specific level - GENTLE PROGRESSION
 * Designed for players aged 6-100 years with many plateaus
 * 
 * @param level Current game level (1-30)
 * @returns Number of cells to memorize
 */
export const getSequenceLength = (level: number): number => {
  if (level === 1) return 2;        // 🟢 Niveau 1 : 2 cellules (très facile - 12.5% de la grille)
  if (level === 2) return 2;        // 🟢 Niveau 2 : 2 cellules (répétition pour confiance)
  if (level <= 4) return 3;         // 🟢 Niveau 3-4 : 3 cellules (18.75% de la grille)
  if (level <= 7) return 4;         // 🟡 Niveau 5-7 : 4 cellules (25% de la grille)
  if (level <= 10) return 5;        // 🟡 Niveau 8-10 : 5 cellules (31.25%)
  if (level <= 14) return 6;        // 🟠 Niveau 11-14 : 6 cellules (37.5%)
  if (level <= 18) return 7;        // 🟠 Niveau 15-18 : 7 cellules (43.75%)
  if (level <= 22) return 8;        // 🔴 Niveau 19-22 : 8 cellules (50%)
  if (level <= 26) return 9;        // 🔴 Niveau 23-26 : 9 cellules (56.25%)
  if (level <= 28) return 10;       // 🔴 Niveau 27-28 : 10 cellules (62.5%)
  return 11;                        // 🏆 Niveau 29-30 : 11 cellules (68.75% - EXPERT)
};

/**
 * Get bonus points for completing milestone levels
 * Progressive rewards to keep players motivated
 */
export const getLevelBonusPoints = (level: number): number => {
  if (level === 1) return 0;        // Pas de bonus au niveau 1 (déjà facile)
  if (level === 5) return 300;      // 🎯 Milestone 1
  if (level === 10) return 800;     // 🎯 Milestone 2 (environ 1000 points total)
  if (level === 15) return 1200;    // 🎯 Milestone 3
  if (level === 20) return 2000;    // 🎯 Milestone 4 (environ 5000 points total)
  if (level === 25) return 3000;    // 🎯 Milestone 5
  if (level === 30) return 5000;    // 🏆 VICTOIRE FINALE ! (environ 15000+ points total)
  
  // Petits bonus tous les 3 niveaux pour encourager
  if (level % 3 === 0) return 100;
  
  return 0;
};

export const COLORS = {
  primary: '#4A90E2',
  secondary: '#7B68EE', // Purple gradient complement
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#1E1E2E',
  surface: '#2A2A3E',
  cellDefault: '#3A3A4E',
  cellActive: '#FFD700',
  cellCorrect: '#4CAF50',
  cellWrong: '#F44336',
  text: '#FFFFFF',
  textSecondary: '#B0B0C0',
};
