# 🌍 Guide d'Implémentation de l'Internationalisation

## 📦 Installation Complète

### Dépendances installées
```bash
npm install i18n-js expo-localization
```

## 🎯 Structure des Fichiers

```
src/
├── services/
│   ├── i18nService.ts          ← Service principal i18n
│   └── locales/
│       ├── fr.json              ✅ Français (complet)
│       ├── en.json              ✅ Anglais (complet)
│       ├── es.json              ⏳ Espagnol (à créer)
│       ├── de.json              ⏳ Allemand (à créer)
│       ├── ja.json              ⏳ Japonais (à créer)
│       ├── ar.json              ⏳ Arabe (à créer)
│       ├── zh.json              ⏳ Chinois (à créer)
│       └── pt.json              ⏳ Portugais (à créer)
└── screens/
    └── LanguageSelectionScreen.tsx  ← Écran de sélection
```

## 🔧 Configuration

### 1. Service i18n (✅ Créé)

Le service `i18nService.ts` gère :
- Détection automatique de la langue système
- Changement de langue dynamique
- Support RTL pour l'arabe
- Sauvegarde des préférences
- Système de listeners pour réactivité

### 2. Fichiers de Traduction

**Structure des clés :**
```json
{
  "common": {...},          // Boutons communs
  "home": {...},            // Écran d'accueil
  "modes": {...},           // Modes de jeu
  "game": {...},            // Interface de jeu
  "challenges": {...},      // Défis quotidiens
  "friends": {...},         // Système d'amis
  "friendChallenges": {...},// Défis entre amis
  "leaderboard": {...},     // Classement
  "profile": {...},         // Profil utilisateur
  "settings": {...},        // Paramètres
  "onboarding": {...},      // Tutoriel
  "achievements": {...},    // Succès
  "errors": {...},          // Messages d'erreur
  "notifications": {...},   // Notifications
  "tips": {...}             // Conseils
}
```

## 🚀 Utilisation dans les Composants

### Méthode 1 : Hook personnalisé (Recommandé)

```typescript
import { useState, useEffect } from 'react';
import { i18nService } from '../services/i18nService';

export const useTranslation = () => {
  const [locale, setLocale] = useState(i18nService.getCurrentLanguage());

  useEffect(() => {
    const unsubscribe = i18nService.subscribe(setLocale);
    return unsubscribe;
  }, []);

  return {
    t: (key: string, options?: object) => i18nService.t(key, options),
    locale,
    isRTL: i18nService.isRTL(),
    setLanguage: (lang: string) => i18nService.setLanguage(lang),
  };
};
```

### Méthode 2 : Utilisation directe

```typescript
import { i18nService } from '../services/i18nService';

// Simple traduction
const text = i18nService.t('common.play');

// Avec interpolation
const level = i18nService.t('game.level', { level: 5 });
// Résultat : "Level 5"

// Avec pluralisation
const lives = i18nService.t('modes.lives', { count: 3 });
```

## 📝 Exemple d'Intégration

### Avant (texte en dur) :
```typescript
<Text style={styles.title}>Défis Quotidiens</Text>
<Text style={styles.subtitle}>Relevez les défis du jour</Text>
<TouchableOpacity>
  <Text>Jouer</Text>
</TouchableOpacity>
```

### Après (i18n) :
```typescript
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <>
      <Text style={styles.title}>{t('challenges.title')}</Text>
      <Text style={styles.subtitle}>{t('challenges.subtitle')}</Text>
      <TouchableOpacity>
        <Text>{t('common.play')}</Text>
      </TouchableOpacity>
    </>
  );
};
```

## 🌐 Spécificités Linguistiques

### Support RTL (Arabe)

Le service gère automatiquement :
```typescript
// Détection RTL
const isRTL = i18nService.isRTL(); // true pour l'arabe

// Les layouts s'inversent automatiquement via I18nManager
```

### Polices Adaptées

Pour les langues asiatiques, ajoutez dans vos styles :
```typescript
const styles = StyleSheet.create({
  text: {
    fontFamily: isJapanese ? 'NotoSansJP' : 'default',
    fontSize: isAsian ? 16 : 14, // Texte plus grand pour CJK
  }
});
```

### Textes Plus Longs (Allemand)

Utilisez `flexWrap` et `numberOfLines` :
```typescript
<Text 
  style={styles.text} 
  numberOfLines={2}
  adjustsFontSizeToFit
>
  {t('modes.classicDesc')}
</Text>
```

## 🔄 Workflow de Traduction

### Étapes Recommandées :

1. **Créer les fichiers manquants** (es, de, ja, ar, zh, pt)
   - Copier `fr.json` comme template
   - Traduire toutes les clés

2. **Tester chaque langue**
   - Vérifier les débordements de texte
   - Valider l'affichage RTL (arabe)
   - Tester les polices asiatiques

3. **Intégrer dans les écrans**
   - Remplacer progressivement les textes en dur
   - Commencer par HomeScreen, puis les autres

4. **Valider la qualité**
   - Relecture native si possible
   - Vérifier la cohérence terminologique
   - Tester le changement de langue en temps réel

## 📱 Écrans à Traduire (Priorité)

### Priorité 1 (Interface principale)
- ✅ HomeScreen
- ✅ GameModeSelector
- ✅ GameScreen
- ✅ SettingsScreen

### Priorité 2 (Social)
- ✅ FriendsScreen
- ✅ FriendChallengesScreen
- ✅ LeaderboardScreen
- ✅ ProfileScreen

### Priorité 3 (Secondaires)
- ✅ ChallengesScreen
- ✅ OnboardingScreen
- ✅ LoginScreen
- ✅ GameOverScreen

## 🎨 Composant de Sélection de Langue

Créer `LanguageSelectionScreen.tsx` avec :
- Liste des langues avec drapeaux
- Nom natif de chaque langue
- Prévisualisation de l'interface
- Changement instantané

## 🧪 Tests de Validation

### Checklist par Langue :

- [ ] **Français** - Langue de base
  - [x] Toutes les clés définies
  - [ ] Intégré dans tous les écrans

- [ ] **Anglais** - International
  - [x] Traduction complète
  - [ ] Validé par natif
  - [ ] Intégré dans tous les écrans

- [ ] **Espagnol** - LATAM + Espagne
  - [ ] Fichier créé
  - [ ] Traduction complète
  - [ ] Caractères accentués testés

- [ ] **Allemand** - Mots composés longs
  - [ ] Fichier créé
  - [ ] Layouts testés (débordement)
  - [ ] Capitales testées

- [ ] **Japonais** - Caractères CJK
  - [ ] Fichier créé
  - [ ] Police adaptée chargée
  - [ ] Taille de texte ajustée

- [ ] **Arabe** - RTL
  - [ ] Fichier créé
  - [ ] I18nManager configuré
  - [ ] Layouts inversés testés
  - [ ] Animations adaptées

- [ ] **Chinois** - Simplifié
  - [ ] Fichier créé
  - [ ] Police adaptée
  - [ ] Caractères affichés

- [ ] **Portugais** - BR + PT
  - [ ] Fichier créé
  - [ ] Variantes testées

## 📊 Métriques de Qualité

- **Couverture** : 100% des textes traduits
- **Cohérence** : Terminologie uniforme
- **Adaptation** : Idiomes culturellement appropriés
- **Performance** : Changement de langue < 100ms
- **Accessibilité** : Support RTL + polices natives

## 🔗 Ressources

- [i18n-js Documentation](https://github.com/fnando/i18n-js)
- [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)
- [React Native I18nManager](https://reactnative.dev/docs/i18nmanager)
- [Unicode CLDR](http://cldr.unicode.org/) - Standards i18n

## 🎯 Prochaines Étapes

1. ✅ Service i18n créé
2. ✅ Fichiers FR et EN complets
3. ⏳ Créer les 6 fichiers manquants (es, de, ja, ar, zh, pt)
4. ⏳ Créer l'écran de sélection de langue
5. ⏳ Créer le hook `useTranslation`
6. ⏳ Intégrer dans HomeScreen (test)
7. ⏳ Intégrer dans tous les écrans
8. ⏳ Tests complets par langue
9. ⏳ Build et validation finale

---

**Note importante** : Les fichiers de traduction espagnol, allemand, japonais, arabe, chinois et portugais doivent être créés en copiant la structure de `fr.json` et en traduisant chaque valeur. Gardez les clés JSON identiques, seules les valeurs doivent être traduites.

**Conseil** : Pour les traductions professionnelles, utilisez des services comme DeepL, Google Translate (avec relecture native), ou des traducteurs professionnels pour garantir la qualité.
