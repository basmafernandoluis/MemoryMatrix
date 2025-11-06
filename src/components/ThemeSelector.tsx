import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../types';
import { ConfettiEffect } from './ConfettiEffect';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 cards per row with margins

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
  userCoins: number;
  userXP: number;
  userLevel: number;
  onCoinsChanged?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  visible,
  onClose,
  userCoins,
  userXP,
  userLevel,
  onCoinsChanged,
}) => {
  const { theme, availableThemes, setTheme, unlockTheme, isThemeUnlocked } = useTheme();
  const [selectedPreview, setSelectedPreview] = useState<Theme | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleThemeSelect = async (selectedTheme: Theme) => {
    // Si c'est le thème actif, ne rien faire
    if (selectedTheme.id === theme.id) {
      setSelectedPreview(selectedTheme);
      return;
    }

    // Vérifier si le thème est déverrouillé
    if (isThemeUnlocked(selectedTheme.id)) {
      // Appliquer directement
      try {
        await setTheme(selectedTheme.id);
        Alert.alert(
          '✨ Thème appliqué',
          `Le thème "${selectedTheme.name}" est maintenant actif !`,
          [{ text: 'OK' }]
        );
      } catch (error: any) {
        Alert.alert('Erreur', error.message || 'Impossible d\'appliquer le thème');
      }
    } else {
      // Afficher l'aperçu et proposer de débloquer
      setSelectedPreview(selectedTheme);
    }
  };

  const handleUnlockTheme = async (themeToUnlock: Theme) => {
    // Vérifier les conditions
    const { unlockRequirements } = themeToUnlock;

    let canUnlock = false;
    let errorMessage = '';

    switch (unlockRequirements.type) {
      case 'free':
        canUnlock = true;
        break;
      case 'coins':
        if (userCoins >= (unlockRequirements.value || 0)) {
          canUnlock = true;
        } else {
          errorMessage = `Vous n'avez pas assez de pièces. Besoin: ${unlockRequirements.value}, Vous avez: ${userCoins}`;
        }
        break;
      case 'xp':
        if (userXP >= (unlockRequirements.value || 0)) {
          canUnlock = true;
        } else {
          errorMessage = `Vous n'avez pas assez d'XP. Besoin: ${unlockRequirements.value}, Vous avez: ${userXP}`;
        }
        break;
      case 'level':
        if (userLevel >= (unlockRequirements.value || 0)) {
          canUnlock = true;
        } else {
          errorMessage = `Niveau insuffisant. Besoin: ${unlockRequirements.value}, Votre niveau: ${userLevel}`;
        }
        break;
      case 'achievement':
        errorMessage = 'Ce thème nécessite un succès spécifique';
        break;
      default:
        errorMessage = 'Conditions de déverrouillage inconnues';
    }

    if (!canUnlock) {
      Alert.alert('Déblocage impossible', errorMessage, [{ text: 'OK' }]);
      return;
    }

    // Confirmer l'achat
    const costText = unlockRequirements.type === 'coins'
      ? `${unlockRequirements.value} 🪙`
      : unlockRequirements.type === 'xp'
      ? `${unlockRequirements.value} XP`
      : 'Gratuit';

    Alert.alert(
      '🔓 Débloquer le thème',
      `Voulez-vous débloquer "${themeToUnlock.name}" pour ${costText} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Débloquer',
          onPress: async () => {
            try {
              await unlockTheme(themeToUnlock.id);
              
              // Afficher confetti
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
              
              // Appliquer le thème automatiquement
              await setTheme(themeToUnlock.id);
              
              Alert.alert(
                '🎉 Thème débloqué !',
                `"${themeToUnlock.name}" a été débloqué et appliqué !`,
                [{ text: 'Super !' }]
              );
              
              // Fermer l'aperçu
              setSelectedPreview(null);
              
              // Notifier que les pièces ont changé
              if (onCoinsChanged) {
                onCoinsChanged();
              }
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de débloquer le thème');
            }
          },
        },
      ]
    );
  };

  const renderUnlockBadge = (themeItem: Theme) => {
    if (isThemeUnlocked(themeItem.id)) {
      if (themeItem.id === theme.id) {
        return (
          <View style={[styles.badge, styles.activeBadge]}>
            <Text style={styles.badgeText}>✓ Actif</Text>
          </View>
        );
      }
      return (
        <View style={[styles.badge, styles.unlockedBadge]}>
          <Text style={styles.badgeText}>Débloqué</Text>
        </View>
      );
    }

    const { unlockRequirements } = themeItem;
    let badgeText = '';
    let badgeColor = '#FFD700';

    switch (unlockRequirements.type) {
      case 'free':
        badgeText = 'Gratuit';
        badgeColor = '#4CAF50';
        break;
      case 'coins':
        badgeText = `${unlockRequirements.value} 🪙`;
        badgeColor = '#FFD700';
        break;
      case 'xp':
        badgeText = `${unlockRequirements.value} XP`;
        badgeColor = '#4A90E2';
        break;
      case 'level':
        badgeText = `Niv. ${unlockRequirements.value}`;
        badgeColor = '#9C27B0';
        break;
      case 'achievement':
        badgeText = '🏆 Succès';
        badgeColor = '#FF9800';
        break;
    }

    return (
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    );
  };

  const renderThemeCard = (themeItem: Theme) => {
    const isActive = themeItem.id === theme.id;
    const isUnlocked = isThemeUnlocked(themeItem.id);

    return (
      <TouchableOpacity
        key={themeItem.id}
        style={[
          styles.themeCard,
          isActive && styles.activeCard,
        ]}
        onPress={() => handleThemeSelect(themeItem)}
      >
        <LinearGradient
          colors={[themeItem.colors.primary, themeItem.colors.primaryDark]}
          style={styles.cardGradient}
        >
          {/* Emoji Icon */}
          <Text style={styles.themeIcon}>{themeItem.icon}</Text>
          
          {/* Theme Name */}
          <Text style={styles.themeName}>{themeItem.name}</Text>
          
          {/* Color Preview */}
          <View style={styles.colorPreview}>
            <View style={[styles.colorDot, { backgroundColor: themeItem.colors.primary }]} />
            <View style={[styles.colorDot, { backgroundColor: themeItem.colors.secondary }]} />
            <View style={[styles.colorDot, { backgroundColor: themeItem.colors.accent }]} />
          </View>
          
          {/* Badge */}
          {renderUnlockBadge(themeItem)}
          
          {/* Lock Overlay */}
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎨 Thèmes</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* User Resources */}
          <View style={styles.resourceBar}>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceText}>🪙 {userCoins}</Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceText}>⭐ {userXP} XP</Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceText}>🎯 Niv. {userLevel}</Text>
            </View>
          </View>

          {/* Themes Grid */}
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.themesGrid}>
              {availableThemes.map(renderThemeCard)}
            </View>
          </ScrollView>

          {/* Preview Modal */}
          {selectedPreview && (
            <Modal
              visible={!!selectedPreview}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setSelectedPreview(null)}
            >
              <View style={styles.previewOverlay}>
                <View style={styles.previewCard}>
                  <LinearGradient
                    colors={[selectedPreview.colors.primary, selectedPreview.colors.primaryDark]}
                    style={styles.previewGradient}
                  >
                    <Text style={styles.previewIcon}>{selectedPreview.icon}</Text>
                    <Text style={styles.previewTitle}>{selectedPreview.name}</Text>
                    <Text style={styles.previewDescription}>{selectedPreview.description}</Text>
                    
                    {/* Color Palette */}
                    <View style={styles.paletteContainer}>
                      <View style={[styles.paletteColor, { backgroundColor: selectedPreview.colors.primary }]} />
                      <View style={[styles.paletteColor, { backgroundColor: selectedPreview.colors.secondary }]} />
                      <View style={[styles.paletteColor, { backgroundColor: selectedPreview.colors.accent }]} />
                      <View style={[styles.paletteColor, { backgroundColor: selectedPreview.colors.cellCorrect }]} />
                    </View>

                    {/* Action Buttons */}
                    {!isThemeUnlocked(selectedPreview.id) ? (
                      <TouchableOpacity
                        style={styles.unlockButton}
                        onPress={() => handleUnlockTheme(selectedPreview)}
                      >
                        <Text style={styles.unlockButtonText}>
                          🔓 Débloquer
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.applyButton}
                        onPress={async () => {
                          await setTheme(selectedPreview.id);
                          setSelectedPreview(null);
                        }}
                      >
                        <Text style={styles.applyButtonText}>✓ Appliquer</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setSelectedPreview(null)}
                    >
                      <Text style={styles.cancelButtonText}>Fermer</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
            </Modal>
          )}
        </View>

        {showConfetti && <ConfettiEffect active={true} />}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  resourceBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  resourceItem: {
    alignItems: 'center',
  },
  resourceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeCard: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  cardGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 48,
    marginTop: 8,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 6,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  unlockedBadge: {
    backgroundColor: '#2196F3',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 40,
  },
  previewOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  previewCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  previewGradient: {
    padding: 24,
    alignItems: 'center',
  },
  previewIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 24,
  },
  paletteContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  paletteColor: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  unlockButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  unlockButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
  },
});
