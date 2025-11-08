import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from '../hooks/useTranslation';

interface EditProfileModalProps {
  visible: boolean;
  currentDisplayName: string;
  currentAvatarEmoji: string;
  onSave: (displayName: string, avatarEmoji: string) => Promise<void>;
  onCancel: () => void;
}

const AVAILABLE_EMOJIS = [
  '🎮', '👾', '🎯', '🏆', '⭐', '🔥',
  '💯', '🚀', '⚡', '💎', '🎲', '🎪',
  '🦸', '🦹', '🧙', '🧑‍🚀', '🧑‍🎤', '🧑‍🎨',
  '😎', '🤖', '👽', '🦁', '🐯', '🦊',
  '🐺', '🦄', '🐉', '🦅', '🦋', '🐙',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  currentDisplayName,
  currentAvatarEmoji,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [selectedEmoji, setSelectedEmoji] = useState(currentAvatarEmoji);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!displayName.trim()) {
      Alert.alert(t('common.error'), t('profile.editModal.errors.emptyName'));
      return;
    }

    if (displayName.trim().length < 3) {
      Alert.alert(t('common.error'), t('profile.editModal.errors.tooShort'));
      return;
    }

    if (displayName.trim().length > 20) {
      Alert.alert(t('common.error'), t('profile.editModal.errors.tooLong'));
      return;
    }

    setIsSaving(true);
    try {
      await onSave(displayName.trim(), selectedEmoji);
    } catch (error: any) {
      const errorMessage = error?.message || t('profile.editModal.errors.saveFailed');
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{t('profile.editModal.title')}</Text>

          {/* Display Name Input */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('profile.editModal.displayName')}</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('profile.editModal.placeholder')}
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              {t('profile.editModal.characterCount', { count: displayName.trim().length })}
            </Text>
          </View>

          {/* Avatar Emoji Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('profile.editModal.avatar')}</Text>
            <ScrollView
              style={styles.emojiScrollView}
              contentContainerStyle={styles.emojiGrid}
              showsVerticalScrollIndicator={false}
            >
              {AVAILABLE_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.emojiButtonSelected,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>{t('profile.editModal.cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                isSaving && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? t('profile.editModal.saving') : t('profile.editModal.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#4ecdc4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ecdc4',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 5,
    textAlign: 'right',
  },
  emojiScrollView: {
    maxHeight: 200,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderColor: '#4ecdc4',
  },
  emoji: {
    fontSize: 28,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4ecdc4',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(78, 205, 196, 0.5)',
  },
  saveButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
