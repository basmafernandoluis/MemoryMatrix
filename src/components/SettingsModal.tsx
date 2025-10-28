/**
 * Settings Modal Component
 * Allows users to configure sound and haptics preferences
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { SPACING, BORDER_RADIUS, SHADOW } from '../constants/designTokens';
import { 
  getAudioEnabled, 
  getHapticsEnabled, 
  setAudioEnabled, 
  setHapticsEnabled 
} from '../utils/soundManager';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);

  useEffect(() => {
    // Load current settings when modal opens
    if (visible) {
      setSoundEnabled(getAudioEnabled());
      setHapticsEnabledState(getHapticsEnabled());
    }
  }, [visible]);

  const handleSoundToggle = async (value: boolean) => {
    setSoundEnabled(value);
    await setAudioEnabled(value);
  };

  const handleHapticsToggle = async (value: boolean) => {
    setHapticsEnabledState(value);
    await setHapticsEnabled(value);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Paramètres</Text>

          {/* Sound Setting */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sons</Text>
              <Text style={styles.settingDescription}>
                Effets sonores du jeu
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ 
                false: '#666666', 
                true: '#4CAF50' 
              }}
              thumbColor={soundEnabled ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#666666"
            />
          </View>

          {/* Haptics Setting */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibrations</Text>
              <Text style={styles.settingDescription}>
                Retour haptique
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleHapticsToggle}
              trackColor={{ 
                false: '#666666', 
                true: '#4CAF50' 
              }}
              thumbColor={hapticsEnabled ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#666666"
            />
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    width: '85%',
    maxWidth: 400,
    ...SHADOW.large,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: SPACING.xxl,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  closeButton: {
    marginTop: SPACING.xxl,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
