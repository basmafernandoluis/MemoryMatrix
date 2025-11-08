# URGENT: Clés de Traduction Manquantes

## Problème Identifié
L'application affiche "missing translation" car les clés suivantes manquent dans tous les fichiers de langue.

## ✅ Fichiers Corrigés
- ✅ `fr.json` - COMPLET (toutes les clés ajoutées)
- ✅ `en.json` - HOME section corrigée (autres sections à faire)

## ⏳ Fichiers à Corriger
- ⏳ `en.json` - Sections: game, profile, settings, errors
- ⏳ `es.json` - Toutes les sections
- ⏳ `de.json` - Toutes les sections
- ⏳ `ja.json` - Toutes les sections
- ⏳ `ar.json` - Toutes les sections
- ⏳ `zh.json` - Toutes les sections
- ⏳ `pt.json` - Toutes les sections

---

## Clés à Ajouter à TOUS les Fichiers

### Section `home` (14 nouvelles clés)
```json
"home": {
  "subtitle": "Challenge",          // Nouveau
  "play": "PLAY",                    // Nouveau (bouton principal)
  "leaderboard": "Classement",       // Nouveau
  "challenges": "Défis",             // Nouveau
  "profile": "Profil",               // Nouveau
  "friends": "Amis",                 // Nouveau
  "settings": "Paramètres",          // Nouveau
  "dailyChallenge": "Défi Quotidien", // Nouveau
  "challengeTarget": "Objectif: {{target}} points", // Nouveau
  "completed": "Complété !",         // Nouveau
  "highScore": "Meilleur Score",     // Nouveau
  "maxLevel": "Niveau Max",          // Nouveau
  "gamesPlayed": "Parties Jouées",   // Nouveau
  // ... clés existantes
}
```

### Section `profile` (14 nouvelles clés)
```json
"profile": {
  "themes": "Thèmes",                              // Nouveau
  "visualEffects": "Effets Visuels",               // Nouveau
  "particles": "Particules",                       // Nouveau
  "confetti": "Confetti",                          // Nouveau
  "glowEffects": "Effets Glow",                    // Nouveau
  "shakeEffects": "Effets Shake",                  // Nouveau
  "earnRewards": "Gagnez XP et Coins...",          // Nouveau
  "highScore": "Meilleur Score",                   // Nouveau
  "maxLevel": "Niveau Max",                        // Nouveau
  "gamesPlayed": "Parties Jouées",                 // Nouveau
  "unlockedAchievements": "Succès Débloqués",     // Nouveau
  "noAchievements": "Aucun succès débloqué...",   // Nouveau
  "signOut": "Se Déconnecter",                     // Nouveau
  "signingOut": "Déconnexion...",                  // Nouveau
  "signOutConfirm": "Êtes-vous sûr...",           // Nouveau
  "profileUpdated": "Profil mis à jour !",         // Nouveau
  "anonymousInfo": "Votre profil est sauvegardé...", // Nouveau
  "anonymousTip": "Ne vous déconnectez pas...",   // Nouveau
}
```

### Section `settings` (2 nouvelles clés)
```json
"settings": {
  "soundDescription": "Effets sonores du jeu",     // Nouveau
  "hapticsDescription": "Retour haptique",         // Nouveau
  // ... clés existantes
}
```

### Section `game` (13 nouvelles clés)
```json
"game": {
  "memorizeSequence": "Mémorise la séquence ({{count}} cases)", // Nouveau
  "memorizeFocusShapes": "🎯 Mémorise les {{count}} formes !", // Nouveau
  "yourTurn": "À ton tour ! Reproduis la séquence", // Nouveau
  "clickShapesInOrder": "🎯 Clique sur les formes...", // Nouveau
  "ready": "Prêt à jouer ?",                       // Nouveau
  "excellent": "✓ Excellent ! Continue...",        // Nouveau
  "tryAgain": "✗ Pas grave ! Réessaye...",         // Nouveau
  "level5": "🎯 Niveau 5 ! Tu es sur la bonne voie !", // Nouveau
  "level10": "🏆 Niveau 10 ! Tu es un Maître !",   // Nouveau
  "level15": "🏅 Niveau 15 ! Champion !",          // Nouveau
  "level20": "🏆 Niveau 20 ! Expert confirmé !",   // Nouveau
  "level25": "👑 Niveau 25 ! Tu es une Légende !", // Nouveau
  "level30": "💎 NIVEAU 30 ! GÉNIE ABSOLU !",      // Nouveau
  // ... clés existantes
}
```

### Section `errors` (1 nouvelle clé)
```json
"errors": {
  "signOutFailed": "Impossible de se déconnecter", // Nouveau
  // ... clés existantes
}
```

---

## Comment Corriger

### Méthode 1: Édition Manuelle (Recommandé)
1. Ouvrir chaque fichier `.json` dans `src/services/locales/`
2. Ajouter les clés manquantes selon la langue
3. Utiliser les traductions de `fr.json` comme référence
4. Pour l'anglais, voir `en.json` (home déjà fait)

### Méthode 2: Copier-Coller Rapide
Pour chaque langue, voici les traductions clés :

#### **EN (English)**
```
subtitle: "Challenge"
play: "PLAY"
leaderboard: "Leaderboard"
challenges: "Challenges"
friends: "Friends"
profile: "Profile"
settings: "Settings"
dailyChallenge: "Daily Challenge"
challengeTarget: "Target: {{target}} points"
completed: "Completed!"
highScore: "High Score"
maxLevel: "Max Level"
gamesPlayed: "Games Played"
themes: "Themes"
visualEffects: "Visual Effects"
particles: "Particles"
confetti: "Confetti"
glowEffects: "Glow Effects"
shakeEffects: "Shake Effects"
earnRewards: "Earn XP and Coins by completing daily challenges!"
unlockedAchievements: "Unlocked Achievements"
noAchievements: "No achievements unlocked. Play to earn some!"
signOut: "Sign Out"
signingOut: "Signing Out..."
signOutConfirm: "Are you sure you want to sign out?"
profileUpdated: "Profile updated!"
anonymousInfo: "Your profile is saved on this device"
anonymousTip: "Tip: Don't sign out to keep your data!"
soundDescription: "Game sound effects"
hapticsDescription: "Haptic feedback"
memorizeSequence: "Memorize the sequence ({{count}} cell{{count, plural, =1 {} other {s}}})"
memorizeFocusShapes: "🎯 Memorize the {{count}} shape{{count, plural, =1 {} other {s}}}!"
yourTurn: "Your turn! Reproduce the sequence"
clickShapesInOrder: "🎯 Click the shapes in order!"
ready: "Ready to play?"
excellent: "✓ Excellent! Keep it up!"
tryAgain: "✗ Don't worry! Try again, you've got this!"
level5: "🎯 Level 5! You're on the right track!"
level10: "🏆 Level 10! You're a Master!"
level15: "🏅 Level 15! Champion!"
level20: "🏆 Level 20! Expert confirmed!"
level25: "👑 Level 25! You're a Legend!"
level30: "💎 LEVEL 30! ABSOLUTE GENIUS!"
signOutFailed: "Unable to sign out"
```

#### **ES (Español)**
```
subtitle: "Desafío"
play: "JUGAR"
leaderboard: "Clasificación"
challenges: "Desafíos"
friends: "Amigos"
profile: "Perfil"
settings: "Configuración"
dailyChallenge: "Desafío Diario"
challengeTarget: "Objetivo: {{target}} puntos"
completed: "¡Completado!"
highScore: "Mejor Puntuación"
maxLevel: "Nivel Máximo"
gamesPlayed: "Partidas Jugadas"
themes: "Temas"
visualEffects: "Efectos Visuales"
particles: "Partículas"
confetti: "Confeti"
glowEffects: "Efectos de Brillo"
shakeEffects: "Efectos de Vibración"
earnRewards: "¡Gana XP y Monedas completando los desafíos diarios!"
unlockedAchievements: "Logros Desbloqueados"
noAchievements: "No hay logros desbloqueados. ¡Juega para conseguir algunos!"
signOut: "Cerrar Sesión"
signingOut: "Cerrando Sesión..."
signOutConfirm: "¿Estás seguro de que quieres cerrar sesión?"
profileUpdated: "¡Perfil actualizado!"
anonymousInfo: "Tu perfil está guardado en este dispositivo"
anonymousTip: "Consejo: ¡No cierres sesión para conservar tus datos!"
soundDescription: "Efectos de sonido del juego"
hapticsDescription: "Retroalimentación háptica"
memorizeSequence: "Memoriza la secuencia ({{count}} casilla{{count, plural, =1 {} other {s}}})"
memorizeFocusShapes: "🎯 ¡Memoriza las {{count}} forma{{count, plural, =1 {} other {s}}}!"
yourTurn: "¡Tu turno! Reproduce la secuencia"
clickShapesInOrder: "🎯 ¡Haz clic en las formas en orden!"
ready: "¿Listo para jugar?"
excellent: "✓ ¡Excelente! ¡Sigue así!"
tryAgain: "✗ ¡No te preocupes! Inténtalo de nuevo, ¡tú puedes!"
level5: "🎯 ¡Nivel 5! ¡Vas por buen camino!"
level10: "🏆 ¡Nivel 10! ¡Eres un Maestro!"
level15: "🏅 ¡Nivel 15! ¡Campeón!"
level20: "🏆 ¡Nivel 20! ¡Experto confirmado!"
level25: "👑 ¡Nivel 25! ¡Eres una Leyenda!"
level30: "💎 ¡NIVEL 30! ¡GENIO ABSOLUTO!"
signOutFailed: "No se pudo cerrar sesión"
```

#### **DE (Deutsch)**
```
subtitle: "Herausforderung"
play: "SPIELEN"
leaderboard: "Bestenliste"
challenges: "Herausforderungen"
friends: "Freunde"
profile: "Profil"
settings: "Einstellungen"
dailyChallenge: "Tägliche Herausforderung"
challengeTarget: "Ziel: {{target}} Punkte"
completed: "Abgeschlossen!"
highScore: "Höchstpunktzahl"
maxLevel: "Max Level"
gamesPlayed: "Gespielte Spiele"
themes: "Themen"
visualEffects: "Visuelle Effekte"
particles: "Partikel"
confetti: "Konfetti"
glowEffects: "Leuchteffekte"
shakeEffects: "Schütteleffekte"
earnRewards: "Verdiene XP und Münzen, indem du tägliche Herausforderungen abschließt!"
unlockedAchievements: "Freigeschaltete Erfolge"
noAchievements: "Keine Erfolge freigeschaltet. Spiele, um welche zu verdienen!"
signOut: "Abmelden"
signingOut: "Abmeldung läuft..."
signOutConfirm: "Bist du sicher, dass du dich abmelden möchtest?"
profileUpdated: "Profil aktualisiert!"
anonymousInfo: "Dein Profil ist auf diesem Gerät gespeichert"
anonymousTip: "Tipp: Melde dich nicht ab, um deine Daten zu behalten!"
soundDescription: "Spielsoundeffekte"
hapticsDescription: "Haptisches Feedback"
memorizeSequence: "Merke dir die Sequenz ({{count}} Feld{{count, plural, =1 {} other {er}}})"
memorizeFocusShapes: "🎯 Merke dir die {{count}} Form{{count, plural, =1 {} other {en}}}!"
yourTurn: "Du bist dran! Wiederhole die Sequenz"
clickShapesInOrder: "🎯 Klicke die Formen in der Reihenfolge!"
ready: "Bereit zu spielen?"
excellent: "✓ Ausgezeichnet! Weiter so!"
tryAgain: "✗ Keine Sorge! Versuch es nochmal, du schaffst das!"
level5: "🎯 Level 5! Du bist auf dem richtigen Weg!"
level10: "🏆 Level 10! Du bist ein Meister!"
level15: "🏅 Level 15! Champion!"
level20: "🏆 Level 20! Bestätigter Experte!"
level25: "👑 Level 25! Du bist eine Legende!"
level30: "💎 LEVEL 30! ABSOLUTES GENIE!"
signOutFailed: "Abmeldung fehlgeschlagen"
```

---

## Test Rapide Après Correction

```powershell
# 1. Compiler
npx tsc --noEmit

# 2. Build
cd android
./gradlew assembleDebug

# 3. Installer
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 4. Tester
# - Ouvrir l'app
# - Vérifier que les textes s'affichent correctement (plus de "missing translation")
# - Changer de langue et vérifier
```

---

## Priorité

**URGENT**: Les 3 écrans migrés (Home, Profile, Game) doivent avoir leurs traductions pour être fonctionnels.

**Ordre de correction recommandé**:
1. ✅ FR - Fait
2. 🔄 EN - En cours (home fait, reste: game, profile, settings, errors)
3. ⏳ ES - À faire
4. ⏳ DE - À faire
5. ⏳ JA - À faire
6. ⏳ AR - À faire
7. ⏳ ZH - À faire
8. ⏳ PT - À faire

---

## Temps Estimé

- EN: 15 minutes (75% fait)
- Chaque autre langue: 20 minutes
- **Total**: ~2-3 heures pour toutes les langues

---

**Date**: 7 novembre 2025  
**Statut**: Correction en cours
