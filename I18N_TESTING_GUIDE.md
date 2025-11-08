# 🧪 Tests i18n - Memory Matrix

## Tests Rapides à Effectuer

### 1. Test de Base (5 minutes)

```bash
# 1. Compiler l'app
cd android
./gradlew assembleDebug

# 2. Installer sur device/émulateur
adb install app/build/outputs/apk/debug/app-debug.apk

# 3. Lancer l'app
```

**Vérifier**:
- [ ] App démarre sans crash
- [ ] Langue du système détectée (ou français par défaut)
- [ ] HomeScreen affiche les textes traduits

### 2. Test de Changement de Langue (10 minutes)

**Procédure**:
1. Ouvrir l'app
2. Cliquer sur ⚙️ (Paramètres) dans HomeScreen
3. Cliquer sur "Langue" / "Language"
4. Sélectionner une autre langue (ex: English)
5. Vérifier que l'interface change immédiatement

**Vérifier pour chaque langue**:

#### 🇬🇧 English
- [ ] HomeScreen: "PLAY", "High Score", "Max Level", "Games Played"
- [ ] Settings: "Settings", "Language", "Sound", "Haptics"
- [ ] Profile: "My Profile", "Edit Profile", "Themes"
- [ ] Game: "Memorize the sequence", "Your turn!"

#### 🇪🇸 Español
- [ ] HomeScreen: "JUGAR", "Mejor Puntuación", "Nivel Máximo"
- [ ] Settings: "Configuración", "Idioma", "Sonido"
- [ ] Profile: "Mi Perfil", "Editar Perfil", "Temas"
- [ ] Game: "Memoriza la secuencia", "¡Tu turno!"

#### 🇩🇪 Deutsch
- [ ] HomeScreen: "SPIELEN", "Höchstpunktzahl", "Max Level"
- [ ] Settings: "Einstellungen", "Sprache", "Ton"
- [ ] Profile: "Mein Profil", "Profil bearbeiten", "Themen"
- [ ] Game: "Sequenz merken", "Du bist dran!"

#### 🇯🇵 日本語
- [ ] HomeScreen: "プレイ", "ハイスコア", "最高レベル"
- [ ] Settings: "設定", "言語", "サウンド"
- [ ] Profile: "プロフィール", "プロフィール編集"
- [ ] Game: "シーケンスを記憶", "あなたの番！"
- [ ] **Note**: Vérifier l'affichage des caractères (police)

#### 🇸🇦 العربية (RTL)
- [ ] Interface inversée (RTL)
- [ ] HomeScreen: "العب", "أعلى نقاط", "أقصى مستوى"
- [ ] Settings: "الإعدادات", "اللغة", "الصوت"
- [ ] Profile: "ملفي الشخصي", "تحرير الملف"
- [ ] Boutons alignés à droite
- [ ] Badge RTL visible dans sélection langue

#### 🇨🇳 简体中文
- [ ] HomeScreen: "开始游戏", "最高分", "最高等级"
- [ ] Settings: "设置", "语言", "声音"
- [ ] Profile: "我的资料", "编辑资料", "主题"
- [ ] Game: "记住顺序", "轮到你了！"
- [ ] **Note**: Vérifier l'affichage des caractères (police)

#### 🇵🇹 Português
- [ ] HomeScreen: "JOGAR", "Pontuação Máxima", "Nível Máximo"
- [ ] Settings: "Configurações", "Idioma", "Som"
- [ ] Profile: "Meu Perfil", "Editar Perfil", "Temas"
- [ ] Game: "Memorize a sequência", "Sua vez!"

### 3. Test de Persistance (5 minutes)

**Procédure**:
1. Changer la langue vers English
2. Fermer complètement l'app (swipe depuis recent apps)
3. Rouvrir l'app

**Vérifier**:
- [ ] L'app reste en English
- [ ] Pas de retour au français
- [ ] AsyncStorage fonctionne

### 4. Test de Détection Système (5 minutes)

**Procédure**:
1. Désinstaller l'app
2. Changer la langue système Android (ex: vers English)
3. Réinstaller l'app
4. Ouvrir l'app

**Vérifier**:
- [ ] App démarre en English (langue système)
- [ ] Détection automatique fonctionne

### 5. Test de Gameplay (10 minutes)

**Procédure**:
1. Choisir une langue (ex: Español)
2. Cliquer sur JUGAR
3. Jouer quelques niveaux

**Vérifier les messages de jeu**:
- [ ] "Memoriza la secuencia (X casillas)"
- [ ] "¡Tu turno! Reproduce la secuencia"
- [ ] "✓ ¡Excelente! ¡Sigue así!"
- [ ] "✗ ¡No te preocupes! Inténtalo de nuevo"
- [ ] Messages de niveau:
  - [ ] Niveau 5: "🎯 ¡Nivel 5! ¡Vas por buen camino!"
  - [ ] Niveau 10: "🏆 ¡Nivel 10! ¡Eres un Maestro!"

### 6. Test RTL Approfondi (10 minutes)

**Procédure**:
1. Changer vers العربية (Arabe)
2. Naviguer dans toute l'app

**Vérifier**:
- [ ] HomeScreen: Layout RTL
- [ ] Menus alignés à droite
- [ ] Icônes inversées
- [ ] Texte aligné à droite
- [ ] Scrolling naturel (droite vers gauche)
- [ ] Pas de problèmes d'affichage

### 7. Test de Performance (5 minutes)

**Vérifier**:
- [ ] Changement de langue instantané (< 100ms)
- [ ] Pas de lag lors de la navigation
- [ ] Pas de flash/flicker lors du changement
- [ ] Mémoire stable (pas de leaks)

### 8. Test des Edge Cases (10 minutes)

**Tester**:
- [ ] Changer de langue 10 fois rapidement → pas de crash
- [ ] Changer pendant une partie → messages mis à jour
- [ ] Changer avec mauvaise connexion → fonctionne (offline)
- [ ] Strings avec interpolation: `{{target}}` remplacé correctement

### 9. Test de Tous les Écrans (15 minutes)

**Pour chaque écran migré**:

#### HomeScreen
- [ ] Titre: "Memory Matrix"
- [ ] Statistiques traduites
- [ ] Boutons de menu traduits
- [ ] Défi quotidien traduit

#### ProfileScreen
- [ ] Titre traduit
- [ ] Tous les labels traduits
- [ ] Boutons traduits
- [ ] Messages d'alerte traduits

#### GameScreen
- [ ] Messages de mémorisation traduits
- [ ] Messages "À ton tour" traduits
- [ ] Messages de félicitations traduits
- [ ] Messages d'erreur traduits

#### SettingsModal
- [ ] Titre traduit
- [ ] Labels traduits
- [ ] Bouton langue avec langue actuelle affichée

#### LanguageSelectionScreen
- [ ] 8 langues affichées
- [ ] Drapeaux corrects
- [ ] Noms natifs corrects
- [ ] Sélection visuelle fonctionne
- [ ] Retour à HomeScreen après sélection

---

## 🐛 Bugs Potentiels à Surveiller

### Problèmes Connus

1. **Polices CJK manquantes**
   - **Symptôme**: Carrés □ ou symboles au lieu de 日本語/中文
   - **Solution**: Installer Noto Sans JP/SC
   - **Priorité**: Moyenne (affecte JA/ZH seulement)

2. **RTL incomplet**
   - **Symptôme**: Certains éléments pas inversés en arabe
   - **Solution**: Vérifier I18nManager.forceRTL()
   - **Priorité**: Haute (affecte expérience AR)

3. **Overflow texte allemand**
   - **Symptôme**: Texte coupé sur boutons
   - **Solution**: Ajuster minWidth ou fontSize
   - **Priorité**: Basse (cosmétique)

4. **Variables non remplacées**
   - **Symptôme**: "Objectif: {{target}} points" affiché tel quel
   - **Solution**: Vérifier appel t(key, { target: value })
   - **Priorité**: Haute (casse l'expérience)

---

## ✅ Checklist de Validation Finale

### Avant Production

- [ ] Tous les tests ci-dessus passés
- [ ] 0 strings hardcodées dans les écrans migrés
- [ ] TypeScript compile sans erreurs
- [ ] App démarre sans warnings i18n
- [ ] Toutes les 8 langues testées manuellement
- [ ] RTL testé en profondeur pour arabe
- [ ] Persistance testée et fonctionne
- [ ] Détection système testée et fonctionne
- [ ] Performance acceptable (< 100ms changement langue)
- [ ] Aucun crash lors des changements de langue

### Tests Automatisés (Optionnel)

```bash
# Vérifier absence de strings hardcodées
./i18n-tools.ps1
# Choisir option 2: Rechercher strings hardcodées

# Vérifier cohérence des clés
./i18n-tools.ps1
# Choisir option 4: Vérifier cohérence des clés

# Compter les traductions
./i18n-tools.ps1
# Choisir option 3: Compter les strings par langue
```

---

## 📊 Rapport de Test à Remplir

```
Date: ___________
Testeur: ___________
Device: ___________
Version Android: ___________

### Résultats

| Test | Statut | Commentaires |
|------|--------|--------------|
| Changement langue | ☐ Pass ☐ Fail | |
| Persistance | ☐ Pass ☐ Fail | |
| Détection système | ☐ Pass ☐ Fail | |
| RTL (Arabe) | ☐ Pass ☐ Fail | |
| Messages de jeu | ☐ Pass ☐ Fail | |
| HomeScreen | ☐ Pass ☐ Fail | |
| ProfileScreen | ☐ Pass ☐ Fail | |
| SettingsModal | ☐ Pass ☐ Fail | |

### Bugs Trouvés

1. _________________________________
2. _________________________________
3. _________________________________

### Notes

_________________________________________________
_________________________________________________
_________________________________________________

### Validation Finale

☐ App prête pour production
☐ Corrections nécessaires

Signature: ___________
```

---

## 🚀 Commandes Rapides

```bash
# Build et test
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.appwizards.memorymatrix/.MainActivity

# Vérifier logs i18n
adb logcat | grep -i "i18n\|translation\|language"

# Changer langue système (test détection)
adb shell setprop persist.sys.locale en-US
adb shell setprop persist.sys.locale es-ES
adb shell setprop persist.sys.locale ja-JP

# Clear data (reset préférences)
adb shell pm clear com.appwizards.memorymatrix
```

---

**Temps total de test**: ~1h30  
**Criticité**: Haute (feature visible par tous les utilisateurs)  
**Statut actuel**: ✅ Prêt pour tests
