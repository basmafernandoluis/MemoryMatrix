# 🔄 Guide de Migration i18n pour les Écrans Existants

## 📋 Checklist par Écran

### ✅ Avant de Commencer
- [ ] Lire `I18N_IMPLEMENTATION_GUIDE.md`
- [ ] Comprendre la structure des clés de traduction
- [ ] Avoir `useTranslation` hook disponible

### 🎯 Ordre de Migration Recommandé

1. **SettingsScreen** (Priorité 1) - Ajouter sélection de langue
2. **HomeScreen** (Priorité 1) - Interface principale
3. **GameScreen** (Priorité 2) - Messages de jeu dynamiques
4. **FriendChallengesScreen** (Priorité 2) - Interface des défis
5. **ChallengesScreen** (Priorité 3) - Défis quotidiens
6. **ProfileScreen** (Priorité 3) - Profil utilisateur
7. **LeaderboardScreen** (Priorité 3) - Classement
8. **OnboardingScreen** (Priorité 4) - Tutorial
9. **GameOverScreen** (Priorité 4) - Fin de partie
10. **FriendsScreen** (Priorité 4) - Liste d'amis

---

## 🔨 Template de Migration

### Étape 1: Importer le Hook

**Avant:**
```typescript
import React from 'react';
import { View, Text } from 'react-native';
```

**Après:**
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';
```

### Étape 2: Utiliser le Hook dans le Composant

**Avant:**
```typescript
export const MyScreen: React.FC<Props> = () => {
  // ...
```

**Après:**
```typescript
export const MyScreen: React.FC<Props> = () => {
  const { t, isRTL } = useTranslation();
  // ...
```

### Étape 3: Remplacer les Strings Hardcodées

**Avant:**
```typescript
<Text style={styles.title}>Défis Entre Amis</Text>
<Text style={styles.subtitle}>Compétitionne avec tes amis</Text>
<TouchableOpacity>
  <Text>Créer un défi</Text>
</TouchableOpacity>
```

**Après:**
```typescript
<Text style={styles.title}>{t('friendChallenges.title')}</Text>
<Text style={styles.subtitle}>{t('friendChallenges.subtitle')}</Text>
<TouchableOpacity>
  <Text>{t('friendChallenges.createChallenge')}</Text>
</TouchableOpacity>
```

### Étape 4: Gérer l'Interpolation

**Avant:**
```typescript
<Text>Niveau {level}</Text>
<Text>Score: {score}</Text>
<Text>Tu as {lives} vies restantes</Text>
```

**Après:**
```typescript
<Text>{t('game.level', { level })}</Text>
<Text>{t('game.score')}: {score}</Text>
<Text>{t('game.livesRemaining', { lives })}</Text>
```

### Étape 5: Adapter les Icônes RTL

**Avant:**
```typescript
<Ionicons name="arrow-back" size={24} />
<Ionicons name="chevron-forward" size={20} />
```

**Après:**
```typescript
<Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} />
<Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} />
```

---

## 📱 Exemples par Type d'Écran

### 1️⃣ HomeScreen

**Strings à Traduire:**
- Titre de l'app
- Boutons de navigation (Jouer, Modes, Classement, Profil)
- Instructions de jeu
- Messages de bienvenue

**Clés de Traduction:**
```typescript
t('home.title')
t('home.welcome')
t('home.playButton')
t('home.modesButton')
t('home.leaderboardButton')
t('home.profileButton')
t('home.instructionsTitle')
t('home.instruction1')
t('home.instruction2')
t('home.instruction3')
t('home.instruction4')
```

### 2️⃣ GameScreen

**Strings à Traduire:**
- Messages de statut (Mémorisez!, À vous!, Correct!)
- Boutons (Pause, Reprendre, Quitter)
- Affichages (Score, Vies, Temps, Niveau)

**Clés de Traduction:**
```typescript
t('game.level', { level })
t('game.score')
t('game.lives')
t('game.time')
t('game.memorize')
t('game.yourTurn')
t('game.correct')
t('game.wrong')
t('game.excellent')
t('game.paused')
t('game.resume')
t('game.quit')
```

### 3️⃣ FriendChallengesScreen

**Strings à Traduire:**
- Titre et sous-titre
- Boutons d'action (Nouveau défi, Accepter, Refuser)
- États (En attente, Actif, Complété)
- Messages (Tu as gagné!, Expiration)

**Clés de Traduction:**
```typescript
t('friendChallenges.title')
t('friendChallenges.subtitle')
t('friendChallenges.newChallenge')
t('friendChallenges.active')
t('friendChallenges.pending')
t('friendChallenges.completed')
t('friendChallenges.accept')
t('friendChallenges.decline')
t('friendChallenges.youWin')
t('friendChallenges.youLose')
t('friendChallenges.waiting', { name })
t('friendChallenges.expiresIn', { time })
```

### 4️⃣ SettingsScreen

**Strings à Traduire:**
- Sections (Général, Audio, Notifications)
- Options (Son, Musique, Vibration, Langue)
- Boutons (Sauvegarder, Annuler)

**Exemple Complet:**
```typescript
import { useTranslation } from '../hooks/useTranslation';

export const SettingsScreen = ({ navigation }) => {
  const { t, isRTL, currentLanguage } = useTranslation();

  return (
    <View>
      <Text>{t('settings.title')}</Text>
      
      <Text>{t('settings.general')}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('LanguageSelection')}>
        <Text>{t('settings.language')}</Text>
        <Text>{currentLanguage?.nativeName}</Text>
      </TouchableOpacity>
      
      <Text>{t('settings.audio')}</Text>
      <Text>{t('settings.sound')}</Text>
      <Text>{t('settings.music')}</Text>
      <Text>{t('settings.vibration')}</Text>
    </View>
  );
};
```

### 5️⃣ ProfileScreen

**Strings à Traduire:**
- Statistiques (Parties jouées, Score total, Taux de victoire)
- Sections (Profil, Succès, Statistiques)
- Boutons (Éditer, Déconnexion)

**Clés de Traduction:**
```typescript
t('profile.title')
t('profile.stats')
t('profile.achievements')
t('profile.level', { level })
t('profile.xp', { current, next })
t('profile.gamesPlayed')
t('profile.totalScore')
t('profile.highScore')
t('profile.winRate')
t('profile.edit')
t('profile.signOut')
```

---

## 🔍 Table de Correspondance Complète

| Écran | Section dans JSON | Nombre de Clés | Notes |
|-------|-------------------|----------------|-------|
| HomeScreen | `home.*` | 14 | Inclut instructions |
| GameScreen | `game.*` | 18 | Messages dynamiques |
| FriendChallengesScreen | `friendChallenges.*` | 25 | Interpolation noms |
| ChallengesScreen | `challenges.*` | 21 | Descriptions dynamiques |
| LeaderboardScreen | `leaderboard.*` | 12 | Filtres et rangs |
| ProfileScreen | `profile.*` | 22 | Stats et édition |
| SettingsScreen | `settings.*` | 21 | + Navigation vers LanguageSelection |
| OnboardingScreen | `onboarding.*` | 21 | 9 slides × 2 strings |
| GameOverScreen | `game.*` | 8 | Réutilise game.* |
| FriendsScreen | `friends.*` | 16 | Codes et statuts |
| Achievements | `achievements.*` | 32 | 16 achievements × 2 |
| Errors | `errors.*` | 8 | Messages génériques |
| Notifications | `notifications.*` | 8 | Push notifications |
| Common | `common.*` | 19 | Boutons réutilisables |

---

## ⚠️ Pièges à Éviter

### ❌ Ne Pas Faire

```typescript
// ❌ Mauvais - hardcodé même avec variable
<Text>Niveau {level}</Text>

// ❌ Mauvais - concaténation manuelle
<Text>{t('score') + ': ' + score}</Text>

// ❌ Mauvais - ignorer RTL
<Ionicons name="arrow-back" />

// ❌ Mauvais - pluralization manuelle
<Text>{lives === 1 ? '1 vie' : `${lives} vies`}</Text>
```

### ✅ À Faire

```typescript
// ✅ Bon - interpolation
<Text>{t('game.level', { level })}</Text>

// ✅ Bon - clé dédiée avec interpolation
<Text>{t('game.scoreValue', { score })}</Text>

// ✅ Bon - RTL-aware
<Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} />

// ✅ Bon - utiliser la clé qui gère ça
<Text>{t('game.lives', { count: lives })}</Text>
```

---

## 🧪 Tests de Validation

### Après Chaque Migration d'Écran

1. **Test visuel FR**
   ```bash
   # Langue par défaut
   npm run android
   ```

2. **Test changement de langue**
   - Ouvrir Settings
   - Changer vers EN, ES, DE
   - Vérifier changement instantané
   - Naviguer vers l'écran migré
   - Valider tous les textes

3. **Test RTL (Arabe)**
   - Sélectionner العربية
   - Vérifier inversion du layout
   - Vérifier direction des icônes
   - Tester navigation

4. **Test CJK (Japonais/Chinois)**
   - Sélectionner 日本語 ou 中文
   - Vérifier lisibilité des caractères
   - Vérifier pas d'overflow
   - Valider espacement

5. **Test mots longs (Allemand)**
   - Sélectionner Deutsch
   - Chercher overflow
   - Vérifier flexWrap fonctionne
   - Tester petits écrans

### Checklist de Qualité

- [ ] Aucun texte hardcodé visible
- [ ] Interpolation fonctionne (noms, nombres)
- [ ] Icônes s'inversent en RTL
- [ ] Pas de crash au changement de langue
- [ ] Layout correct dans les 8 langues
- [ ] Polices lisibles (CJK)
- [ ] Pas d'overflow texte
- [ ] Boutons accessibles

---

## 📊 Progression de Migration

| Écran | Priorité | Statut | Clés | % Complété |
|-------|----------|--------|------|------------|
| LanguageSelectionScreen | ✅ | Fait | N/A | 100% |
| SettingsScreenExample | ✅ | Exemple | 15 | 100% |
| SettingsScreen | 🔴 | À faire | 21 | 0% |
| HomeScreen | 🔴 | À faire | 14 | 0% |
| GameScreen | 🟡 | À faire | 18 | 0% |
| FriendChallengesScreen | 🟡 | À faire | 25 | 0% |
| ChallengesScreen | 🟡 | À faire | 21 | 0% |
| ProfileScreen | 🟢 | À faire | 22 | 0% |
| LeaderboardScreen | 🟢 | À faire | 12 | 0% |
| OnboardingScreen | 🟢 | À faire | 21 | 0% |
| GameOverScreen | 🟢 | À faire | 8 | 0% |
| FriendsScreen | 🟢 | À faire | 16 | 0% |

**Légende:** 🔴 Critique | 🟡 Important | 🟢 Normal

---

## 🚀 Commandes Utiles

```bash
# Vérifier compilation après migration
npx tsc --noEmit

# Chercher strings hardcodées restantes (français)
grep -r "Jouer\|Niveau\|Score\|Défis" src/screens/*.tsx

# Chercher apostrophes françaises (indicateur de hardcoded)
grep -r "l'\|d'\|qu'\|s'" src/screens/*.tsx

# Tester build avec toutes les langues
cd android && ./gradlew assembleDebug

# Vérifier taille des fichiers de traduction
ls -lh src/services/locales/
```

---

## 💡 Tips Pro

1. **Migration par petits blocs**: Ne pas tout migrer d'un coup, tester au fur et à mesure
2. **Réutiliser common.***: Pour OK, Cancel, Save, etc.
3. **Créer des helpers**: Pour formater dates, nombres selon locale
4. **Documenter les clés manquantes**: Si une clé n'existe pas, l'ajouter dans les 8 fichiers
5. **Git commit par écran**: Facilite le rollback si problème
6. **Tester sur device réel**: Émulateur peut masquer des problèmes de font

---

## 📞 Assistance

**Problème de clé manquante?**
- Ajouter la clé dans `fr.json`
- Traduire dans les 7 autres fichiers
- Redémarrer Metro bundler

**Problème de layout RTL?**
- Vérifier utilisation de `isRTL`
- Utiliser `flexDirection: isRTL ? 'row-reverse' : 'row'`
- Tester avec `I18nManager.forceRTL(true)`

**Problème de police CJK?**
- Installer `expo-font`
- Charger Noto Sans JP/SC
- Utiliser `fontFamily` conditionnel

**Texte trop long?**
- Ajouter `flexWrap: 'wrap'`
- Utiliser `numberOfLines` avec `ellipsizeMode`
- Ajuster `fontSize` dynamiquement

---

**Bonne migration! 🌍✨**
