# 🎉 Test des Particules - Debug Version

## Nouvelles fonctionnalités de debug ajoutées

### 1. Console Logs 📝
Quand tu cliques sur une cellule, tu devrais voir dans React Native Debugger ou Logcat :

```
🎮 CELL PRESSED, index: 2, particleRef exists: true
🎯 TRIGGERING PARTICLES at cell center
🎉 PARTICLES TRIGGER CALLED! { x: 50, y: 50, color: '#A78BFA', intensity: 'medium', type: undefined }
🎉 PARTICLES CREATED: 8
🎉 PARTICLES ANIMATION COMPLETE
```

### 2. Compteur Visuel 🔢
**NOUVEAU** : En haut à droite de chaque cellule, tu devrais maintenant voir un compteur vert qui affiche le nombre de particules actives :
- Exemple : `8 🎉` quand tu cliques

### 3. Comment voir les logs Android

#### Option A : React Native Debugger
1. Secoue ton téléphone
2. Appuie sur "Debug"
3. Ouvre Chrome à `localhost:19000/debugger-ui`
4. Ouvre la Console (F12)

#### Option B : Logcat (plus fiable)
```powershell
cd C:\Users\<TON_USER>\AppData\Local\Android\Sdk\platform-tools
.\adb logcat | Select-String "ReactNativeJS"
```

### 4. Tests à faire

#### Test 1 : Compteur visible
1. Lance le jeu
2. Commence à jouer
3. Clique sur une cellule
4. **REGARDE EN HAUT À DROITE DE LA CELLULE** → tu dois voir `8 🎉` pendant ~500ms

#### Test 2 : Console logs
1. Active Logcat ou React Native Debugger
2. Clique sur plusieurs cellules
3. Vérifie que tu vois les messages 🎮 🎯 🎉

### 5. Diagnostics possibles

| Symptôme | Cause probable |
|----------|---------------|
| Pas de logs du tout | Son activé mais debug non connecté |
| Logs 🎮 mais pas 🎉 | `particleRef.current` est null |
| Logs 🎉 mais pas de compteur | ClickParticles pas monté correctement |
| Compteur visible mais pas de particules | Problème de `StyleSheet.absoluteFill` |

### 6. Debug avancé (optionnel)

Tu peux décommenter cette ligne dans `ClickParticles.tsx` ligne ~132 :
```typescript
// backgroundColor: 'rgba(255,0,0,0.1)', // DEBUG: uncomment to see bounds
```

Cela montrera un fond rouge transparent sur toute la zone des particules.

---

## 📲 Installation APK

L'APK sera ici après le build :
```
c:\MemoryMatrix\android\app\build\outputs\apk\debug\app-debug.apk
```

Envoie-le sur ton téléphone et installe-le.

## 🐛 Rapport de bug attendu

Après tes tests, dis-moi :
1. ✅ ou ❌ Tu vois le compteur `8 🎉` ?
2. ✅ ou ❌ Tu vois les logs dans la console ?
3. ✅ ou ❌ Tu vois des particules animées ?
4. Si rien : envoie-moi une capture d'écran des logs Logcat

---

**Version debug :** v2.1 - 2024
