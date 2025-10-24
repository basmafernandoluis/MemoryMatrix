import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProgress } from '../types';
import { firebaseService } from '../services/firebase';
import { firestoreService } from '../services/firestore';
import { EditProfileModal } from '../components/EditProfileModal';

interface ProfileScreenProps {
  userProgress: UserProgress | null;
  userId: string;
  onBack: () => void;
  onSignOut: () => void;
  onProfileUpdated: (progress: UserProgress) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProgress,
  userId,
  onBack,
  onSignOut,
  onProfileUpdated,
}) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const displayName = userProgress?.displayName || `Guest_${userId.substring(0, 6)}`;
  const avatarEmoji = userProgress?.avatarEmoji || '👤';

  const handleSaveProfile = async (newDisplayName: string, newAvatarEmoji: string) => {
    try {
      await firestoreService.updateProfile(userId, newDisplayName, newAvatarEmoji);
      
      // Update local state
      const updatedProgress: UserProgress = {
        ...userProgress!,
        displayName: newDisplayName,
        avatarEmoji: newAvatarEmoji,
      };
      onProfileUpdated(updatedProgress);
      
      setIsEditModalVisible(false);
      Alert.alert('Succès', 'Profil mis à jour !');
    } catch (error) {
      throw error;
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await firebaseService.signOut();
              onSignOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter');
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: Date) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const achievementCount = userProgress?.achievements?.length || 0;
  const totalAchievements = 6; // Total achievements available

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mon Profil</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarEmoji}</Text>
            </View>
          </View>
          <Text style={styles.username}>{displayName}</Text>
          <Text style={styles.userId}>ID: {userId.substring(0, 8)}...</Text>
          
          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditModalVisible(true)}
          >
            <Text style={styles.editButtonText}>✏️ Modifier mon profil</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProgress?.highScore || 0}</Text>
            <Text style={styles.statLabel}>Meilleur Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProgress?.maxLevelReached || 1}</Text>
            <Text style={styles.statLabel}>Niveau Max</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProgress?.totalGamesPlayed || 0}</Text>
            <Text style={styles.statLabel}>Parties Jouées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {achievementCount}/{totalAchievements}
            </Text>
            <Text style={styles.statLabel}>Succès</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Succès Débloqués</Text>
          <View style={styles.achievementsContainer}>
            {userProgress?.achievements && userProgress.achievements.length > 0 ? (
              userProgress.achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>
                    {achievement.includes('first_game') && '🎮'}
                    {achievement.includes('score_100') && '💯'}
                    {achievement.includes('score_500') && '🔥'}
                    {achievement.includes('score_1000') && '⭐'}
                    {achievement.includes('level_5') && '🚀'}
                    {achievement.includes('games_10') && '🎯'}
                  </Text>
                  <Text style={styles.achievementName}>
                    {achievement.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noAchievements}>
                Aucun succès débloqué. Jouez pour en obtenir !
              </Text>
            )}
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          <Text style={styles.signOutButtonText}>
            {isSigningOut ? 'Déconnexion...' : '🚪 Se Déconnecter'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Memory Matrix v1.0</Text>
          <Text style={styles.footerText}>© 2025 AppWizards</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditModalVisible}
        currentDisplayName={displayName}
        currentAvatarEmoji={avatarEmoji}
        onSave={handleSaveProfile}
        onCancel={() => setIsEditModalVisible(false)}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4ecdc4',
  },
  avatarText: {
    fontSize: 40,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 5,
  },
  editButton: {
    marginTop: 15,
    backgroundColor: '#4ecdc4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  editButtonText: {
    color: '#1a1a2e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  achievementsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4ecdc4',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  noAchievements: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#c0392b',
  },
  signOutButtonDisabled: {
    backgroundColor: 'rgba(231, 76, 60, 0.5)',
    borderColor: 'rgba(192, 57, 43, 0.5)',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 5,
  },
});
