import { firestore } from './firebase';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  level: number;
  timestamp: Date;
  rank?: number;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'alltime';

export class LeaderboardService {
  private readonly COLLECTION = 'leaderboard';
  
  // Save a score to the leaderboard
  async saveScore(
    userId: string,
    displayName: string,
    score: number,
    level: number
  ): Promise<void> {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const weekNumber = this.getWeekNumber(now);
      const year = now.getFullYear();
      
      // Save to all-time leaderboard
      await firestore()
        .collection(this.COLLECTION)
        .doc(`alltime_${userId}`)
        .set({
          userId,
          displayName,
          score,
          level,
          timestamp: firestore.FieldValue.serverTimestamp(),
          period: 'alltime',
        }, { merge: true });

      // Save to daily leaderboard
      await firestore()
        .collection(this.COLLECTION)
        .doc(`daily_${today}_${userId}`)
        .set({
          userId,
          displayName,
          score,
          level,
          timestamp: firestore.FieldValue.serverTimestamp(),
          period: 'daily',
          date: today,
        }, { merge: true });

      // Save to weekly leaderboard
      await firestore()
        .collection(this.COLLECTION)
        .doc(`weekly_${year}_${weekNumber}_${userId}`)
        .set({
          userId,
          displayName,
          score,
          level,
          timestamp: firestore.FieldValue.serverTimestamp(),
          period: 'weekly',
          week: weekNumber,
          year,
        }, { merge: true });
    } catch (error) {
      console.error('Error saving score to leaderboard:', error);
      throw error;
    }
  }

  // Get top scores for a specific period
  async getTopScores(period: LeaderboardPeriod, limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const baseQuery = firestore().collection(this.COLLECTION);
      let query;

      // Add filters based on period - IMPORTANT: where() clauses must match index field order
      if (period === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        query = baseQuery
          .where('date', '==', today)
          .where('period', '==', period)
          .orderBy('score', 'desc');
      } else if (period === 'weekly') {
        const now = new Date();
        const weekNumber = this.getWeekNumber(now);
        const year = now.getFullYear();
        query = baseQuery
          .where('week', '==', weekNumber)
          .where('year', '==', year)
          .where('period', '==', period)
          .orderBy('score', 'desc');
      } else {
        // all-time
        query = baseQuery
          .where('period', '==', period)
          .orderBy('score', 'desc');
      }

      const snapshot = await query.limit(limit).get();

      const entries: LeaderboardEntry[] = [];
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        entries.push({
          userId: data.userId,
          displayName: data.displayName || 'Guest',
          score: data.score,
          level: data.level,
          timestamp: data.timestamp?.toDate() || new Date(),
          rank: index + 1,
        });
      });

      return entries;
    } catch (error) {
      console.error('Error getting top scores:', error);
      return [];
    }
  }

  // Get user's rank in a specific period
  async getUserRank(userId: string, period: LeaderboardPeriod): Promise<number | null> {
    try {
      const baseQuery = firestore().collection(this.COLLECTION);
      let userQuery;

      // Add date filters - IMPORTANT: where() clauses must match index field order
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

      const userScore = userSnapshot.docs[0].data().score;

      // Build query for better scores
      let betterQuery;
      if (period === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        betterQuery = baseQuery
          .where('date', '==', today)
          .where('period', '==', period)
          .where('score', '>', userScore);
      } else if (period === 'weekly') {
        const now = new Date();
        const weekNumber = this.getWeekNumber(now);
        const year = now.getFullYear();
        betterQuery = baseQuery
          .where('week', '==', weekNumber)
          .where('year', '==', year)
          .where('period', '==', period)
          .where('score', '>', userScore);
      } else {
        betterQuery = baseQuery
          .where('period', '==', period)
          .where('score', '>', userScore);
      }

      // Count how many scores are better
      const betterScoresSnapshot = await betterQuery.get();

      return betterScoresSnapshot.size + 1;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  // Get user's best score for a period
  async getUserScore(userId: string, period: LeaderboardPeriod): Promise<LeaderboardEntry | null> {
    try {
      const baseQuery = firestore().collection(this.COLLECTION);
      let query;

      // Add date filters - IMPORTANT: where() clauses must match index field order
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
        score: data.score,
        level: data.level,
        timestamp: data.timestamp?.toDate() || new Date(),
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
