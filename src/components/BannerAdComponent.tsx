/**
 * BannerAdComponent - Bannière publicitaire adaptative
 * 
 * Caractéristiques :
 * - Position fixe en bas de l'écran
 * - Taille adaptative pour tous les devices
 * - Respect des safe areas
 * - Pas de chevauchement avec le contenu
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AD_UNIT_IDS } from '../services/adManager';

interface BannerAdComponentProps {
  /**
   * Taille de la bannière
   * - BANNER: 320x50
   * - LARGE_BANNER: 320x100
   * - MEDIUM_RECTANGLE: 300x250
   * - FULL_BANNER: 468x60
   * - LEADERBOARD: 728x90
   * - ADAPTIVE_BANNER: Adaptatif selon la largeur de l'écran
   */
  size?: BannerAdSize;
  
  /**
   * Afficher en bas de l'écran (par défaut) ou inline
   */
  position?: 'bottom' | 'inline';
}

export const BannerAdComponent: React.FC<BannerAdComponentProps> = ({
  size = BannerAdSize.ADAPTIVE_BANNER,
  position = 'bottom',
}) => {
  const insets = useSafeAreaInsets();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adHeight, setAdHeight] = useState(50); // Hauteur par défaut

  const containerStyle = position === 'bottom' 
    ? [
        styles.bottomContainer,
        {
          paddingBottom: insets.bottom,
          // Afficher seulement quand la pub est chargée pour éviter le flash
          opacity: adLoaded ? 1 : 0,
        }
      ]
    : styles.inlineContainer;

  return (
    <View 
      style={containerStyle}
      pointerEvents="box-none" // Permet les clics sur la pub seulement
    >
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
          setAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error);
        }}
        onSizeChange={(event) => {
          setAdHeight(event.height);
        }}
      />
    </View>
  );
};

/**
 * Composant spacer pour compenser la hauteur de la bannière
 * À utiliser dans les ScrollView pour éviter que le contenu soit caché
 */
export const BannerSpacer: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      style={{ 
        height: 50 + insets.bottom, // Hauteur typique d'une bannière + safe area
      }} 
    />
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inlineContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
});
