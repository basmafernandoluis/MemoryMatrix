# 🎯 Index Manquants pour Afficher le Rang Utilisateur

## ⚡ CRÉATION RAPIDE - 15 Index

**Console Firebase:** https://console.firebase.google.com/project/memorymatrix-9781b/firestore/indexes

Clique sur **"Create Index"** pour chaque index ci-dessous.

---

## 📊 ALL-TIME RANK (5 index)

### INDEX 1: Global Rank All-Time
```
Collection ID: leaderboard
Field 1: period → Ascending
Field 2: globalScore → Ascending
Query scope: Collection
```

### INDEX 2: Classic Rank All-Time
```
Collection ID: leaderboard
Field 1: period → Ascending
Field 2: classicBest → Ascending
Query scope: Collection
```

### INDEX 3: Survival Rank All-Time
```
Collection ID: leaderboard
Field 1: period → Ascending
Field 2: survivalBest → Ascending
Query scope: Collection
```

### INDEX 4: TimeAttack Rank All-Time
```
Collection ID: leaderboard
Field 1: period → Ascending
Field 2: timeAttackBest → Ascending
Query scope: Collection
```

### INDEX 5: Zen Rank All-Time
```
Collection ID: leaderboard
Field 1: period → Ascending
Field 2: zenBest → Ascending
Query scope: Collection
```

---

## 📅 DAILY RANK (5 index)

### INDEX 6: Global Rank Daily
```
Collection ID: leaderboard
Field 1: date → Ascending
Field 2: period → Ascending
Field 3: globalScore → Ascending
Query scope: Collection
```

### INDEX 7: Classic Rank Daily
```
Collection ID: leaderboard
Field 1: date → Ascending
Field 2: period → Ascending
Field 3: classicBest → Ascending
Query scope: Collection
```

### INDEX 8: Survival Rank Daily
```
Collection ID: leaderboard
Field 1: date → Ascending
Field 2: period → Ascending
Field 3: survivalBest → Ascending
Query scope: Collection
```

### INDEX 9: TimeAttack Rank Daily
```
Collection ID: leaderboard
Field 1: date → Ascending
Field 2: period → Ascending
Field 3: timeAttackBest → Ascending
Query scope: Collection
```

### INDEX 10: Zen Rank Daily
```
Collection ID: leaderboard
Field 1: date → Ascending
Field 2: period → Ascending
Field 3: zenBest → Ascending
Query scope: Collection
```

---

## 📆 WEEKLY RANK (5 index)

### INDEX 11: Global Rank Weekly
```
Collection ID: leaderboard
Field 1: week → Ascending
Field 2: year → Ascending
Field 3: period → Ascending
Field 4: globalScore → Ascending
Query scope: Collection
```

### INDEX 12: Classic Rank Weekly
```
Collection ID: leaderboard
Field 1: week → Ascending
Field 2: year → Ascending
Field 3: period → Ascending
Field 4: classicBest → Ascending
Query scope: Collection
```

### INDEX 13: Survival Rank Weekly
```
Collection ID: leaderboard
Field 1: week → Ascending
Field 2: year → Ascending
Field 3: period → Ascending
Field 4: survivalBest → Ascending
Query scope: Collection
```

### INDEX 14: TimeAttack Rank Weekly
```
Collection ID: leaderboard
Field 1: week → Ascending
Field 2: year → Ascending
Field 3: period → Ascending
Field 4: timeAttackBest → Ascending
Query scope: Collection
```

### INDEX 15: Zen Rank Weekly
```
Collection ID: leaderboard
Field 1: week → Ascending
Field 2: year → Ascending
Field 3: period → Ascending
Field 4: zenBest → Ascending
Query scope: Collection
```

---

## ✅ Checklist de Progression

### All-Time Rank (5)
- [ ] Global → period, globalScore (ASC)
- [ ] Classic → period, classicBest (ASC)
- [ ] Survival → period, survivalBest (ASC)
- [ ] TimeAttack → period, timeAttackBest (ASC)
- [ ] Zen → period, zenBest (ASC)

### Daily Rank (5)
- [ ] Global → date, period, globalScore (ASC)
- [ ] Classic → date, period, classicBest (ASC)
- [ ] Survival → date, period, survivalBest (ASC)
- [ ] TimeAttack → date, period, timeAttackBest (ASC)
- [ ] Zen → date, period, zenBest (ASC)

### Weekly Rank (5)
- [ ] Global → week, year, period, globalScore (ASC)
- [ ] Classic → week, year, period, classicBest (ASC)
- [ ] Survival → week, year, period, survivalBest (ASC)
- [ ] TimeAttack → week, year, period, timeAttackBest (ASC)
- [ ] Zen → week, year, period, zenBest (ASC)

---

## ⏱️ Temps Estimé

- **5 minutes** pour créer les 15 index
- **2-10 minutes** pour que Firestore les construise
- **Total:** ~15 minutes

---

## 🎉 Résultat Final

Après création des 15 index :

✅ **30 index actifs au total** :
- 15 pour afficher les classements (DESCENDING)
- 15 pour calculer les rangs (ASCENDING)

✅ **Fonctionnalités complètes** :
- Classement Global / Classic / Survival / TimeAttack / Zen
- Périodes Jour / Semaine / Total
- Affichage "Votre Position #X"
- Aucune erreur `failed-precondition`

---

## 🐛 Test Final

1. Redémarre l'app : `npx expo start --clear`
2. Va dans "🏆 Classement"
3. Teste les 3 onglets de période
4. Teste les 5 onglets de mode
5. Vérifie que "Votre Position #X" s'affiche
6. Vérifie qu'aucune erreur n'apparaît dans la console

---

*Dernière mise à jour: 27 octobre 2025*
