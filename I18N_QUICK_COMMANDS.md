# 🚀 Commandes Rapides i18n

## 📦 Installation (Déjà fait ✅)
```bash
npm install i18n-js expo-localization
```

## 🔍 Vérifications

### Compilation TypeScript
```bash
npx tsc --noEmit
```

### Rechercher strings hardcodées (Français)
```bash
# PowerShell
Get-ChildItem -Path src\screens -Filter *.tsx -Recurse | Select-String -Pattern "Jouer|Niveau|Score|Défis|Amis"

# Alternative Git Bash
grep -r "Jouer\|Niveau\|Score\|Défis\|Amis" src/screens/*.tsx
```

### Vérifier structure des fichiers JSON
```bash
# Compter les clés dans chaque fichier
Get-Content src\services\locales\fr.json | Select-String -Pattern '"[a-zA-Z]+":' | Measure-Object
Get-Content src\services\locales\en.json | Select-String -Pattern '"[a-zA-Z]+":' | Measure-Object
```

## 🏗️ Build

### Debug Build
```bash
cd android
.\gradlew assembleDebug
cd ..
```

### Release Build
```bash
cd android
.\gradlew assembleRelease
cd ..
```

### Clean Build
```bash
cd android
.\gradlew clean
.\gradlew assembleDebug
cd ..
```

## 🧪 Tests

### Lancer l'app
```bash
npm run android
```

### Test avec langue spécifique (dans l'app)
```typescript
// Dans la console Metro
import i18nServiceInstance from './src/services/i18nService';
await i18nServiceInstance.setLanguage('en');
```

### Tester RTL
```typescript
// Forcer RTL pour tests
import { I18nManager } from 'react-native';
I18nManager.forceRTL(true);
// Puis redémarrer l'app
```

## 📊 Statistiques

### Taille des fichiers de traduction
```bash
ls -lh src\services\locales\
```

### Compter le nombre total de traductions
```bash
# PowerShell
$total = 0
Get-ChildItem -Path src\services\locales -Filter *.json | ForEach-Object {
    $count = (Get-Content $_.FullName | Select-String -Pattern '"[a-zA-Z]+":' | Measure-Object).Count
    Write-Host "$($_.Name): $count clés"
    $total += $count
}
Write-Host "Total: $total traductions"
```

## 🔧 Maintenance

### Ajouter une nouvelle clé de traduction
1. Ajouter dans `fr.json`
2. Copier dans les 7 autres fichiers
3. Traduire chaque valeur
4. Vérifier compilation: `npx tsc --noEmit`

### Exemple
```json
// Dans fr.json
"newFeature": {
  "title": "Nouvelle fonctionnalité",
  "description": "Description en français"
}

// Dans en.json
"newFeature": {
  "title": "New Feature",
  "description": "Description in English"
}
// ... répéter pour es, de, ja, ar, zh, pt
```

### Ajouter une nouvelle langue
1. Créer `src/services/locales/XX.json` (copier fr.json)
2. Traduire toutes les valeurs
3. Ajouter dans `i18nService.ts`:
```typescript
import xx from './locales/xx.json';

const i18n = new I18n({
  // ... autres langues
  xx,
});

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  // ... autres langues
  { code: 'xx', name: 'Language', nativeName: 'Native Name', flag: '🏴', isRTL: false },
];
```

## 📱 Intégration dans un Écran

### Template rapide
```typescript
import { useTranslation } from '../hooks/useTranslation';

export const MyScreen = () => {
  const { t, isRTL } = useTranslation();
  
  return (
    <View>
      <Text>{t('section.key')}</Text>
    </View>
  );
};
```

## 🌍 Navigation vers Sélection de Langue

### Ajouter la route (dans navigation)
```typescript
// App.tsx ou navigation config
<Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
```

### Naviguer depuis Settings
```typescript
<TouchableOpacity onPress={() => navigation.navigate('LanguageSelection')}>
  <Text>{t('settings.language')}</Text>
</TouchableOpacity>
```

## 🐛 Debugging

### Voir la langue actuelle
```typescript
import i18nServiceInstance from './src/services/i18nService';
console.log('Current language:', i18nServiceInstance.getCurrentLanguage());
```

### Tester interpolation
```typescript
console.log(t('game.level', { level: 5 })); // "Niveau 5" en FR
```

### Vérifier RTL
```typescript
import { I18nManager } from 'react-native';
console.log('RTL enabled:', I18nManager.isRTL);
```

### Clear AsyncStorage (reset langue)
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('@memory_matrix_language');
```

## 📋 Checklist Avant Déploiement

```bash
# 1. Vérifier compilation
npx tsc --noEmit

# 2. Rechercher hardcoded strings
grep -r "Jouer\|Niveau" src/screens/

# 3. Build de test
cd android && .\gradlew assembleDebug && cd ..

# 4. Lancer et tester
npm run android

# 5. Tester changement de langue
# (dans l'app: Settings -> Language -> changer)

# 6. Tester RTL (sélectionner العربية)

# 7. Tester CJK (sélectionner 日本語 ou 中文)

# 8. Build release
cd android && .\gradlew assembleRelease && cd ..
```

## 🎯 Tests Critiques

### Test 1: Changement de langue dynamique
1. Lancer app (langue par défaut: FR)
2. Aller dans Settings
3. Tap sur "Langue"
4. Sélectionner "English"
5. ✅ Interface doit changer instantanément
6. Naviguer vers Home
7. ✅ Tous les textes en anglais

### Test 2: Persistance
1. Changer langue vers "Español"
2. Fermer complètement l'app
3. Redémarrer l'app
4. ✅ App doit démarrer en espagnol

### Test 3: RTL
1. Sélectionner "العربية"
2. ✅ Layout inversé (navigation à droite)
3. ✅ Texte aligné à droite
4. ✅ Icônes inversées

### Test 4: Interpolation
1. Jouer une partie
2. ✅ "Niveau 1" → "Level 1" → "Nivel 1" selon langue

## 📞 Aide Rapide

**Erreur de compilation?**
```bash
npx tsc --noEmit
# Lire le message d'erreur
# Vérifier import des hooks/services
```

**Clé de traduction manquante?**
```bash
# Ajouter dans fr.json
# Copier dans les 7 autres
# Redémarrer Metro: Ctrl+C puis npm run android
```

**Texte hardcodé encore visible?**
```bash
# Chercher le texte
grep -r "texte visible" src/
# Remplacer par t('section.key')
```

**RTL ne fonctionne pas?**
```typescript
// Vérifier dans i18nService.ts
I18nManager.forceRTL(isRTL);
I18nManager.allowRTL(isRTL);
// Puis redémarrer app
```

## 🔗 Liens Utiles

- [Documentation i18n-js](https://github.com/fnando/i18n-js)
- [expo-localization](https://docs.expo.dev/versions/latest/sdk/localization/)
- [React Native I18nManager](https://reactnative.dev/docs/i18nmanager)

---

**Dernière mise à jour:** ${new Date().toLocaleDateString('fr-FR')}
