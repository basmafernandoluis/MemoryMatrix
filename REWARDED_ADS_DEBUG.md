# 🎁 Guide de Debug - Publicités Récompensées (Rewarded Ads)

## 🔍 Problème Identifié
Les rewarded ads fonctionnent en DEV mais pas en PRODUCTION.

## ✅ Corrections Appliquées

### 1. **Retry Agressif avec Backoff Exponentiel**
- **Avant**: 1 seul retry après 10 secondes
- **Après**: Retry automatique avec délais progressifs:
  - Tentative 1 → 3 secondes
  - Tentative 2 → 5 secondes  
  - Tentative 3 → 10 secondes
  - Tentative 4 → 15 secondes
  - Tentative 5+ → 30 secondes

### 2. **Keywords pour Ciblage Non-Personnalisé**
Ajout de `keywords: ['games', 'puzzle', 'family']` pour améliorer le fill rate en mode non-personnalisé.

### 3. **Logging Amélioré**
- Logs détaillés avec préfixe `[REWARDED]`
- Affichage du nombre de tentatives
- Information sur l'état de l'ad unit

### 4. **Gestion des Timeouts**
Nettoyage approprié des timeouts pour éviter les memory leaks.

## 🧪 Comment Tester

### En Mode Debug (Test Ads)
```bash
cd android
./gradlew assembleDebug
```
Les test ads devraient fonctionner normalement.

### En Mode Release (Production Ads)
```bash
cd android
./gradlew assembleRelease
# ou
./gradlew bundleRelease
```

**IMPORTANT**: Installer l'APK release sur un appareil physique, pas en émulateur.

## 📊 Vérifier les Logs

Utilisez ADB logcat pour voir les logs en temps réel:

```bash
adb logcat | grep -E "REWARDED|AdMob"
```

### Logs Attendus - Succès ✅
```
[REWARDED] Loading rewarded ad (attempt 1)
[REWARDED] ✅ Rewarded ad loaded successfully (child-safe, non-personalized)
[REWARDED] isRewardedAvailable(): true
[REWARDED] 🎬 Attempting to show rewarded ad...
[REWARDED] ✅ Rewarded ad shown successfully
[REWARDED] 🎁 User earned reward: {...}
[REWARDED] 👋 Rewarded ad closed
```

### Logs Attendus - Retry 🔄
```
[REWARDED] Loading rewarded ad (attempt 1)
[REWARDED] ❌ Failed to load: {...}
[REWARDED] Retry #1 in 3s...
[REWARDED] Loading rewarded ad (attempt 2)
[REWARDED] ✅ Rewarded ad loaded successfully
```

## 🎯 Checklist Pré-Production

### ✅ Console AdMob
1. Aller sur https://apps.admob.com
2. Vérifier que l'Ad Unit de Rewarded est **actif**
3. Vérifier les paramètres:
   - **Type**: Rewarded
   - **Status**: Active
   - **Fill Rate**: Devrait être > 50%

### ✅ Paramètres Ad Unit
Dans AdMob Console → Ad Units → Rewarded:
- [ ] "Show to users under consent age" = **Enabled**
- [ ] "Content rating" = **G (General Audiences)**
- [ ] "Non-personalized ads" = **Enabled**
- [ ] "Mediation" = Vérifier que des réseaux sont configurés

### ✅ App Configuration
- [ ] `app.json` contient le bon `androidAppId`
- [ ] `google-services.json` est à jour
- [ ] Version de `react-native-google-mobile-ads` ≥ 14.0.0

## 🚨 Problèmes Courants

### Problème: "No fill" en Production
**Cause**: Taux de remplissage faible pour les rewarded ads non-personnalisées.

**Solutions**:
1. Activer plus de réseaux de médiation dans AdMob
2. Attendre 24-48h après création de l'Ad Unit (période de "warming up")
3. Vérifier que l'app est publiée sur Play Store (les apps non publiées ont moins de fill)

### Problème: Ads ne se chargent jamais
**Cause**: Possible problème de configuration AdMob.

**Solutions**:
1. Vérifier que l'Ad Unit ID est correct
2. Vérifier que l'App ID est correct dans `app.json`
3. Rebuild complet après changement de config:
   ```bash
   npx expo prebuild --clean
   cd android && ./gradlew clean && ./gradlew assembleRelease
   ```

### Problème: Timeout permanent malgré retries
**Cause**: Restrictions géographiques ou App non approuvée.

**Solutions**:
1. Tester depuis différents pays (VPN)
2. Vérifier le statut de l'app dans Google Play Console
3. Attendre l'approbation complète de l'app par Google

## 📱 Test en Production

### Méthode recommandée:
1. Générer un Release APK signé
2. Installer sur appareil physique (pas émulateur)
3. Attendre 5-10 minutes après installation
4. Tester l'affichage des rewarded ads
5. Vérifier les logs via `adb logcat`

### Commandes utiles:
```bash
# Build release
cd android && ./gradlew assembleRelease

# Installer sur device
adb install android/app/build/outputs/apk/release/app-release.apk

# Voir les logs
adb logcat | grep -E "REWARDED|AdMob|GoogleMobileAds"
```

## 📈 Monitoring Post-Production

Après déploiement, surveiller dans AdMob Console:
- **Requests**: Nombre de demandes d'ads
- **Impressions**: Nombre d'ads affichées
- **Fill Rate**: % de demandes satisfaites
- **eCPM**: Revenu par 1000 impressions

**Objectif**: Fill rate > 70% après 48h

## 🆘 Support

Si le problème persiste après ces corrections:

1. **Logs détaillés**: Capturer logs complets avec `adb logcat > logs.txt`
2. **AdMob Console**: Screenshot des paramètres Ad Unit
3. **Test Différents Devices**: Tester sur 2-3 appareils différents
4. **Contacter Support AdMob**: Avec les logs et détails de configuration

---

**Date de dernière modification**: 19 Novembre 2025
**Version du fix**: 1.1.0
