# 🚨 ERREUR: Permission Firestore - SOLUTION RAPIDE

## Problème

```
ERROR: [firestore/permission-denied] 
The caller does not have permission to execute the specified operation.
```

## Cause

Les règles de sécurité Firestore ne permettent pas encore l'accès à la nouvelle collection `challenges` créée pour les défis quotidiens (Phase 8).

## ✅ SOLUTION (2 minutes)

### Méthode 1: Console Firebase (Plus Simple)

1. **Ouvrir Firebase Console**
   - https://console.firebase.google.com
   - Sélectionner votre projet

2. **Aller dans Firestore**
   - Menu → "Firestore Database"
   - Onglet "Règles"

3. **Ajouter cette règle**
   
   Cherchez la section `service cloud.firestore` et ajoutez cette règle AVANT le dernier `}` :

   ```javascript
   // Challenges collection - pour les défis quotidiens
   match /challenges/{userId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```

4. **Publier**
   - Cliquer sur "Publier"
   - Attendre la confirmation

5. **Redémarrer l'app**
   ```powershell
   # Dans votre terminal Expo
   # Arrêter avec Ctrl+C puis relancer
   npm start
   ```

### Méthode 2: Remplacer Toutes les Règles

Si vous préférez tout remplacer, copiez le contenu complet du fichier `firestore.rules` dans la console.

### Méthode 3: Firebase CLI (Automatique)

Si Firebase CLI est installé :

```powershell
# Exécuter le script
.\deploy-firestore-rules.ps1

# Ou manuellement
firebase deploy --only firestore:rules
```

## Vérification

Après déploiement :
1. ✅ Redémarrer l'app Expo
2. ✅ Ouvrir "Défis Quotidiens"
3. ✅ Plus d'erreur `permission-denied`
4. ✅ Les défis s'affichent

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `FIREBASE_RULES_SETUP.md` - Guide complet
- `firestore.rules` - Fichier des règles
- `PHASE8_DEFIS_QUOTIDIENS.md` - Documentation Phase 8

## Questions ?

Cette règle est **sécurisée** : elle permet à chaque utilisateur de lire/écrire UNIQUEMENT ses propres défis, pas ceux des autres.
