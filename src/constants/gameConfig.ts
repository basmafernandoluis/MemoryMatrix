// Game configuration constants - Phase 1 MVP

export const GAME_CONFIG = {
  // Grid configuration
  GRID_SIZE: 4, // 4x4 grid (16 cells)
  
  // Game rules
  INITIAL_LIVES: 3,
  INITIAL_LEVEL: 1,
  MAX_LEVEL: 10,
  
  // Scoring
  POINTS_PER_LEVEL: 100,
  POINTS_PER_CORRECT_CELL: 10,
  
  // Timing (in milliseconds)
  CELL_HIGHLIGHT_DURATION: 600,
  DELAY_BETWEEN_CELLS: 400,
  FEEDBACK_DURATION: 1000,
  
  // Difficulty progression
  SEQUENCE_BASE_LENGTH: 3, // Starting sequence length at level 1
  SEQUENCE_INCREMENT: 1, // Add 1 cell per level
  
  // Visual
  CELL_SIZE: 70,
  CELL_GAP: 10,
};

export const COLORS = {
  primary: '#4A90E2',
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
