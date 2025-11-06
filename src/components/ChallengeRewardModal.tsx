import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ChallengeRewardModalProps {
	visible: boolean;
	xp: number;
	coins: number;
	onClose: () => void;
}

// Minimal placeholder modal to avoid type errors until full implementation.
export const ChallengeRewardModal: React.FC<ChallengeRewardModalProps> = ({ visible, xp, coins, onClose }) => {
	if (!visible) return null;
	return (
		<Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.content}>
					<Text style={styles.title}>Récompense du Défi</Text>
					<Text style={styles.reward}>⭐ XP: {xp}</Text>
					<Text style={styles.reward}>🪙 Coins: {coins}</Text>
					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<Text style={styles.closeText}>Fermer</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		width: '80%',
		backgroundColor: '#1e1e2e',
		padding: 24,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.15)',
	},
	title: {
		fontSize: 20,
		fontWeight: '700',
		color: '#fff',
		marginBottom: 12,
	},
	reward: {
		fontSize: 16,
		color: '#fff',
		marginBottom: 6,
	},
	closeButton: {
		marginTop: 16,
		backgroundColor: '#4e8cff',
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
	},
	closeText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#fff',
	},
});

export default ChallengeRewardModal;
