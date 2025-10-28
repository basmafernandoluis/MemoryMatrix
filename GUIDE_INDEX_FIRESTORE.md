# 🔥 Guide: Créer les Index Firestore Manuellement

## 🎯 Liens Directs de Création

Clique sur ces liens pour créer automatiquement chaque index :

---

## 📊 INDEX POUR CLASSEMENT GLOBAL

### 1. Global All-Time (DESC)
```
Collection: leaderboard
Champs:
  - period (Ascending)
  - globalScore (Descending)
```
**🔗 Lien direct:** https://console.firebase.google.com/v1/r/project/memorymatrix-9781b/firestore/indexes?create_composite=ClZwcm9qZWN0cy9tZW1vcnltYXRyaXgtOTc4MWIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2xlYWRlcmJvYXJkL2luZGV4ZXMvXxABGgoKBnBlcmlvZBABGg8KC2dsb2JhbFNjb3JlEAIaDAoIX19uYW1lX18QAg

---

### 2. Global Daily (DESC)
```
Collection: leaderboard
Champs:
  - date (Ascending)
  - period (Ascending)
  - globalScore (Descending)
```
**Création manuelle:**
1. Va sur: https://console.firebase.google.com/project/memorymatrix-9781b/firestore/indexes
2. Clique "Create Index"
3. Collection ID: `leaderboard`
4. Ajoute les champs:
   - `date` → Ascending
   - `period` → Ascending
   - `globalScore` → Descending
5. Query scope: Collection
6. Clique "Create"

---

### 3. Global Weekly (DESC)
```
Collection: leaderboard
Champs:
  - week (Ascending)
  - year (Ascending)
  - period (Ascending)
  - globalScore (Descending)
```
**Création manuelle:**
1. Console → Indexes → Create Index
2. Collection: `leaderboard`
3. Champs:
   - `week` → Ascending
   - `year` → Ascending
   - `period` → Ascending
   - `globalScore` → Descending

---

## 🎮 INDEX POUR MODE CLASSIQUE

### 4. Classic All-Time
```
Collection: leaderboard
Champs:
  - period (Ascending)
  - classicBest (Descending)
```

### 5. Classic Daily
```
Collection: leaderboard
Champs:
  - date (Ascending)
  - period (Ascending)
  - classicBest (Descending)
```

### 6. Classic Weekly
```
Collection: leaderboard
Champs:
  - week (Ascending)
  - year (Ascending)
  - period (Ascending)
  - classicBest (Descending)
```

---

## 🔥 INDEX POUR MODE SURVIE

### 7. Survival All-Time
```
Collection: leaderboard
Champs:
  - period (Ascending)
  - survivalBest (Descending)
```

### 8. Survival Daily
```
Collection: leaderboard
Champs:
  - date (Ascending)
  - period (Ascending)
  - survivalBest (Descending)
```

### 9. Survival Weekly
```
Collection: leaderboard
Champs:
  - week (Ascending)
  - year (Ascending)
  - period (Ascending)
  - survivalBest (Descending)
```

---

## ⏱️ INDEX POUR MODE CONTRE-LA-MONTRE

### 10. TimeAttack All-Time
```
Collection: leaderboard
Champs:
  - period (Ascending)
  - timeAttackBest (Descending)
```

### 11. TimeAttack Daily
```
Collection: leaderboard
Champs:
  - date (Ascending)
  - period (Ascending)
  - timeAttackBest (Descending)
```

### 12. TimeAttack Weekly
```
Collection: leaderboard
Champs:
  - week (Ascending)
  - year (Ascending)
  - period (Ascending)
  - timeAttackBest (Descending)
```

---

## 🧘 INDEX POUR MODE ZEN

### 13. Zen All-Time
```
Collection: leaderboard
Champs:
  - period (Ascending)
  - zenBest (Descending)
```

### 14. Zen Daily
```
Collection: leaderboard
Champs:
  - date (Ascending)
  - period (Ascending)
  - zenBest (Descending)
```

### 15. Zen Weekly
```
Collection: leaderboard
Champs:
  - week (Ascending)
  - year (Ascending)
  - period (Ascending)
  - zenBest (Descending)
```

---

## 📈 INDEX POUR COMPARAISON DE RANG

### 16. Global Rank Comparison (ASC)
```
Collection: leaderboard
Champs:
  - period (Ascending)
  - globalScore (Ascending)
```

### 17. Global Daily Rank (ASC)
```
Collection: leaderboard
Champs:
  - date (Ascending)
  - period (Ascending)
  - globalScore (Ascending)
```

### 18. Global Weekly Rank (ASC)
```
Collection: leaderboard
Champs:
  - week (Ascending)
  - year (Ascending)
  - period (Ascending)
  - globalScore (Ascending)
```

---

## 🚀 MÉTHODE RAPIDE: COPIER-COLLER JSON

### Option 1: Firebase Console (UI)

1. **Ouvre la console Firebase:**
   https://console.firebase.google.com/project/memorymatrix-9781b/firestore/indexes

2. **Pour chaque index, clique "Create Index" et copie-colle:**

#### Index 1: Global All-Time DESC
```
Collection ID: leaderboard
Query scope: Collection

Fields:
period        Ascending
globalScore   Descending
```

#### Index 2: Classic All-Time DESC
```
Collection ID: leaderboard
Query scope: Collection

Fields:
period       Ascending
classicBest  Descending
```

#### Index 3: Survival All-Time DESC
```
Collection ID: leaderboard
Query scope: Collection

Fields:
period        Ascending
survivalBest  Descending
```

#### Index 4: TimeAttack All-Time DESC
```
Collection ID: leaderboard
Query scope: Collection

Fields:
period          Ascending
timeAttackBest  Descending
```

#### Index 5: Zen All-Time DESC
```
Collection ID: leaderboard
Query scope: Collection

Fields:
period   Ascending
zenBest  Descending
```

---

## ⚡ PRIORISATION DES INDEX

Si tu veux commencer avec le minimum, crée **d'abord ces 5 index** :

### ✅ PRIORITÉ HAUTE (Créer en premier)

1. **Global All-Time DESC** → Classement principal
2. **Classic All-Time DESC** → Mode le plus joué
3. **Survival All-Time DESC** → Mode populaire
4. **TimeAttack All-Time DESC** → Mode compétitif
5. **Zen All-Time DESC** → Mode détendu

Ces 5 index permettront de tester le système avec période "All-Time" uniquement.

---

## 📋 CHECKLIST DE VÉRIFICATION

Après création des index:

- [ ] Global All-Time (period, globalScore DESC)
- [ ] Classic All-Time (period, classicBest DESC)
- [ ] Survival All-Time (period, survivalBest DESC)
- [ ] TimeAttack All-Time (period, timeAttackBest DESC)
- [ ] Zen All-Time (period, zenBest DESC)
- [ ] Global Daily (date, period, globalScore DESC)
- [ ] Global Weekly (week, year, period, globalScore DESC)
- [ ] Classic Daily + Weekly
- [ ] Survival Daily + Weekly
- [ ] TimeAttack Daily + Weekly
- [ ] Zen Daily + Weekly
- [ ] Global Rank ASC (pour comparaison)
- [ ] Daily Rank ASC
- [ ] Weekly Rank ASC

---

## ⏱️ TEMPS D'ATTENTE

- **Création d'index:** 2-5 minutes par index
- **Total pour 18 index:** ~30-60 minutes
- **Status:** Vert = Ready, Orange = Building, Rouge = Error

---

## 🐛 EN CAS D'ERREUR

### Erreur: "Index already exists"
✅ C'est normal ! Passe au suivant.

### Erreur: "Field not found"
⚠️ Vérifie l'orthographe exacte: `globalScore`, `classicBest`, etc.

### Erreur: "Invalid query scope"
✅ Assure-toi de sélectionner "Collection" (pas "Collection group")

---

## 🧪 TESTER LES INDEX

Une fois les 5 index prioritaires créés:

1. Lance l'app
2. Va dans "Classement"
3. Sélectionne l'onglet "🏆 Total"
4. Teste chaque mode (Global, Classic, Survival, TimeAttack, Zen)
5. Si ça marche = Index OK ✅
6. Si erreur = Crée les index Daily/Weekly manquants

---

## 💡 ASTUCE PRO

Pour gagner du temps, ouvre **5 onglets** de la console Firebase et crée les 5 index prioritaires **en parallèle** ! ⚡

---

*Dernière mise à jour: 27 octobre 2025*
