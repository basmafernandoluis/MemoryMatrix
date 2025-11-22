import { firestore } from './firebase';
import { LeaderboardEntry, LeaderboardPeriod, LeaderboardMode, GameMode } from '../types';

export { LeaderboardEntry, LeaderboardPeriod, LeaderboardMode } from '../types';

// Conversion des scores en points globaux
const calculateGlobalPoints = (score: number, level: number, mode: GameMode): number => {
  switch (mode) {
    case 'classic':
      // Mode Classique: score × 1.0 (référence)
      return Math.floor(score * 1.0);
    
    case 'survival':
      // Mode Survie: streak seulement (pas de multiplication)
      // On garde juste le streak comme score pour éviter l'explosion des points
      return score;
    
    case 'timeAttack':
      // Mode Contre-la-Montre: score × 1.0 (pas de bonus)
      return Math.floor(score * 1.0);
    
    case 'zen':
      // Mode Zen: score × 0.8 (mode détendu, moins de points)
      return Math.floor(score * 0.8);
    
    case 'custom':
      // Mode Custom: score × 0.9 (configuration personnalisée)
      return Math.floor(score * 0.9);
    
    default:
      return score;
  }
};

export class LeaderboardService {
  private readonly COLLECTION = 'leaderboard';
  
  // Save a score to the leaderboard
  async saveScore(
    userId: string,
    displayName: string,
    score: number,
    level: number,
    mode: GameMode = 'classic' // Nouveau paramètre
  ): Promise<void> {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const weekNumber = this.getWeekNumber(now);
      const year = now.getFullYear();
      
      // Calculer les points globaux selon le mode
      const globalPoints = calculateGlobalPoints(score, level, mode);
      
      // Déterminer le champ de score spécifique au mode
      const modeScoreField = `${mode}Best`;
      
      // Récupérer l'entrée existante pour comparaison
      const docId = `alltime_${userId}`;
      const existingDoc = await firestore()
        .collection(this.COLLECTION)
        .doc(docId)
        .get();
      
      const existingData = existingDoc.exists() ? existingDoc.data() : null;
      
      // Préparer les données à sauvegarder
      const baseData = {
        userId,
        displayName,
        lastPlayed: firestore.FieldValue.serverTimestamp(),
        gamesPlayed: (existingData?.gamesPlayed || 0) + 1,
      };
      
      // Mettre à jour le score global (MEILLEUR score, pas accumulation)
      const currentGlobalBest = existingData?.globalScore || 0;
      const newGlobalScore = Math.max(currentGlobalBest, globalPoints);
      
      // Mettre à jour le meilleur score pour ce mode (maximum)
      const currentModeBest = existingData?.[modeScoreField] || 0;
      const newModeBest = Math.max(currentModeBest, score);
      
      // Mettre à jour le meilleur niveau atteint (maximum)
      const currentMaxLevel = existingData?.level || 1;
      const newMaxLevel = Math.max(currentMaxLevel, level);
      
      // Save to all-time leaderboard
      await firestore()
        .collection(this.COLLECTION)
        .doc(docId)
        .set({
          ...baseData,
          globalScore: newGlobalScore,
          classicBest: mode === 'classic' ? newModeBest : (existingData?.classicBest || 0),
          survivalBest: mode === 'survival' ? newModeBest : (existingData?.survivalBest || 0),
          timeAttackBest: mode === 'timeAttack' ? newModeBest : (existingData?.timeAttackBest || 0),
          zenBest: mode === 'zen' ? newModeBest : (existingData?.zenBest || 0),
          focusChallengeBest: mode === 'focusChallenge' ? newModeBest : (existingData?.focusChallengeBest || 0),
          timestamp: firestore.FieldValue.serverTimestamp(),
          period: 'alltime',
          level: newMaxLevel, // Meilleur niveau atteint (pas le dernier)
        }, { merge: true });

      // Save to daily leaderboard (avec mode) - GARDER LE MEILLEUR SCORE
      const dailyDocId = `daily_${today}_${mode}_${userId}`;
      const dailyDoc = await firestore()
        .collection(this.COLLECTION)
        .doc(dailyDocId)
        .get();
      
      const dailyData = dailyDoc.exists() ? dailyDoc.data() : null;
      const currentDailyScore = dailyData?.[modeScoreField] || 0;
      const currentDailyGlobal = dailyData?.globalScore || 0;
      
      // Ne sauvegarder que si c'est un MEILLEUR score
      const newDailyScore = Math.max(currentDailyScore, score);
      const newDailyGlobal = Math.max(currentDailyGlobal, globalPoints);
      
      await firestore()
        .collection(this.COLLECTION)
        .doc(dailyDocId)
        .set({
          ...baseData,
          [modeScoreField]: newDailyScore, // ✅ MEILLEUR score du jour
          globalScore: newDailyGlobal,
          timestamp: firestore.FieldValue.serverTimestamp(),
          period: 'daily',
          date: today,
          mode,
          level: newDailyScore > currentDailyScore ? level : (dailyData?.level || level), // Niveau du meilleur score
        }, { merge: true });

      // Save to weekly leaderboard (avec mode) - GARDER LE MEILLEUR SCORE
      const weeklyDocId = `weekly_${year}_${weekNumber}_${mode}_${userId}`;
      const weeklyDoc = await firestore()
        .collection(this.COLLECTION)
        .doc(weeklyDocId)
        .get();
      
      const weeklyData = weeklyDoc.exists() ? weeklyDoc.data() : null;
      const currentWeeklyScore = weeklyData?.[modeScoreField] || 0;
      const currentWeeklyGlobal = weeklyData?.globalScore || 0;
      
      // Ne sauvegarder que si c'est un MEILLEUR score
      const newWeeklyScore = Math.max(currentWeeklyScore, score);
      const newWeeklyGlobal = Math.max(currentWeeklyGlobal, globalPoints);
      
      await firestore()
        .collection(this.COLLECTION)
        .doc(weeklyDocId)
        .set({
          ...baseData,
          [modeScoreField]: newWeeklyScore, // ✅ MEILLEUR score de la semaine
          globalScore: newWeeklyGlobal,
          timestamp: firestore.FieldValue.serverTimestamp(),
          period: 'weekly',
          week: weekNumber,
          year,
          mode,
          level: newWeeklyScore > currentWeeklyScore ? level : (weeklyData?.level || level), // Niveau du meilleur score
        }, { merge: true });
    } catch (error) {
      console.error('Error saving score to leaderboard:', error);
      throw error;
    }
  }

  // Get top scores for a specific period and mode
  async getTopScores(
    period: LeaderboardPeriod,
    leaderboardMode: LeaderboardMode = 'global',
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    try {
      const baseQuery = firestore().collection(this.COLLECTION);
      let query;

      // Déterminer le champ de tri selon le mode de classement
      const sortField = leaderboardMode === 'global' ? 'globalScore' : `${leaderboardMode}Best`;

      // Add filters based on period
      if (period === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        query = baseQuery
          .where('date', '==', today)
          .where('period', '==', period)
          .orderBy(sortField, 'desc');
      } else if (period === 'weekly') {
        const now = new Date();
        const weekNumber = this.getWeekNumber(now);
        const year = now.getFullYear();
        query = baseQuery
          .where('week', '==', weekNumber)
          .where('year', '==', year)
          .where('period', '==', period)
          .orderBy(sortField, 'desc');
      } else {
        // all-time
        query = baseQuery
          .where('period', '==', period)
          .orderBy(sortField, 'desc');
      }

      const snapshot = await query.limit(limit * 3).get(); // Récupérer plus d'entrées pour filtrer après

      const entriesMap = new Map<string, LeaderboardEntry>();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const userId = data.userId;
        const currentScore = data[sortField] || 0;
        
        // Ne garder que le meilleur score par joueur
        const existingEntry = entriesMap.get(userId);
        const existingScore = existingEntry 
          ? (sortField === 'globalScore' ? existingEntry.globalScore : existingEntry[sortField as keyof LeaderboardEntry] as number || 0)
          : 0;
          
        if (!existingEntry || currentScore > existingScore) {
          entriesMap.set(userId, {
            userId: data.userId,
            displayName: data.displayName || 'Guest',
            globalScore: data.globalScore || 0,
            classicBest: data.classicBest || 0,
            survivalBest: data.survivalBest || 0,
            timeAttackBest: data.timeAttackBest || 0,
            zenBest: data.zenBest || 0,
            focusChallengeBest: data.focusChallengeBest || 0,
            gamesPlayed: data.gamesPlayed || 0,
            lastPlayed: data.lastPlayed?.toDate() || new Date(),
            timestamp: data.timestamp?.toDate() || new Date(),
            level: data.level || 0,
          });
        }
      });

      // Convertir en array et trier par score
      const entries = Array.from(entriesMap.values())
        .sort((a, b) => {
          const scoreA = (sortField === 'globalScore' ? a.globalScore : a[sortField as keyof LeaderboardEntry]) as number || 0;
          const scoreB = (sortField === 'globalScore' ? b.globalScore : b[sortField as keyof LeaderboardEntry]) as number || 0;
          return scoreB - scoreA;
        })
        .slice(0, limit) // Limiter au nombre demandé
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      return entries;
    } catch (error) {
      console.error('Error getting top scores:', error);
      return [];
    }
  }

  // Get user's rank in a specific period and mode
  async getUserRank(
    userId: string,
    period: LeaderboardPeriod,
    leaderboardMode: LeaderboardMode = 'global'
  ): Promise<number | null> {
    try {
      const baseQuery = firestore().collection(this.COLLECTION);
      let userQuery;

      // Déterminer le champ de tri selon le mode
      const sortField = leaderboardMode === 'global' ? 'globalScore' : `${leaderboardMode}Best`;

      // Add date filters
      if (period === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        userQuery = baseQuery
          .where('date', '==', today)
          .where('period', '==', period)
          .where('userId', '==', userId);
      } else if (period === 'weekly') {
        const now = new Date();
        const weekNumber = this.getWeekNumber(now);
        const year = now.getFullYear();
        userQuery = baseQuery
          .where('week', '==', weekNumber)
          .where('year', '==', year)
          .where('period', '==', period)
          .where('userId', '==', userId);
      } else {
        userQuery = baseQuery
          .where('period', '==', period)
          .where('userId', '==', userId);
      }

      // Get user's score
      const userSnapshot = await userQuery.limit(1).get();

      if (userSnapshot.empty) {
        return null;
      }

      const userScore = userSnapshot.docs[0].data()[sortField] || 0;

      // Build query for better scores
      let betterQuery;
      if (period === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        betterQuery = baseQuery
          .where('date', '==', today)
          .where('period', '==', period)
          .where(sortField, '>', userScore);
      } else if (period === 'weekly') {
        const now = new Date();
        const weekNumber = this.getWeekNumber(now);
        const year = now.getFullYear();
        betterQuery = baseQuery
          .where('week', '==', weekNumber)
          .where('year', '==', year)
          .where('period', '==', period)
          .where(sortField, '>', userScore);
      } else {
        betterQuery = baseQuery
          .where('period', '==', period)
          .where(sortField, '>', userScore);
      }

      // Count how many scores are better
      const betterScoresSnapshot = await betterQuery.get();

      return betterScoresSnapshot.size + 1;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  // Get user's best score for a period and mode
  async getUserScore(
    userId: string,
    period: LeaderboardPeriod,
    leaderboardMode: LeaderboardMode = 'global'
  ): Promise<LeaderboardEntry | null> {
    try {
      const baseQuery = firestore().collection(this.COLLECTION);
      let query;

      // Add date filters
      if (period === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        query = baseQuery
          .where('date', '==', today)
          .where('period', '==', period)
          .where('userId', '==', userId);
      } else if (period === 'weekly') {
        const now = new Date();
        const weekNumber = this.getWeekNumber(now);
        const year = now.getFullYear();
        query = baseQuery
          .where('week', '==', weekNumber)
          .where('year', '==', year)
          .where('period', '==', period)
          .where('userId', '==', userId);
      } else {
        query = baseQuery
          .where('period', '==', period)
          .where('userId', '==', userId);
      }

      const snapshot = await query.limit(1).get();

      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs[0].data();
      return {
        userId: data.userId,
        displayName: data.displayName || 'Guest',
        globalScore: data.globalScore || 0,
        classicBest: data.classicBest || 0,
        survivalBest: data.survivalBest || 0,
        timeAttackBest: data.timeAttackBest || 0,
        zenBest: data.zenBest || 0,
        focusChallengeBest: data.focusChallengeBest || 0,
        gamesPlayed: data.gamesPlayed || 0,
        lastPlayed: data.lastPlayed?.toDate() || new Date(),
        timestamp: data.timestamp?.toDate() || new Date(),
        level: data.level || 0,
      };
    } catch (error) {
      console.error('Error getting user score:', error);
      return null;
    }
  }

  // Helper: Get ISO week number
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}

export const leaderboardService = new LeaderboardService();
