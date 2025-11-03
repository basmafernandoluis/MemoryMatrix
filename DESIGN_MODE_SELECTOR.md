# 📱 Aperçu Visuel - Nouveau Sélecteur de Modes

## Avant (Carousel)
```
╔════════════════════════════════════════╗
║         Choisir un Mode                ║
╠════════════════════════════════════════╣
║                                        ║
║    ┌──────────────────────────┐       ║
║    │  🎮  CLASSIQUE           │       ║
║    │  10 niveaux, 5 vies      │       ║
║    │                          │       ║
║    │  ❤️ 5 vies               │       ║
║    │                          │       ║
║    │      [JOUER]             │       ║
║    └──────────────────────────┘       ║
║                                        ║
║        ● ○ ○ ○ ○                      ║
║  Glissez pour découvrir...             ║
╚════════════════════════════════════════╝
```
*Problème: Un seul mode visible, nécessite swipe*

---

## Après (Grid) ✨
```
╔════════════════════════════════════════╗
║ ← Retour  Choisir un Mode              ║
╠════════════════════════════════════════╣
║                                        ║
║  ┌──────────────┐  ┌──────────────┐   ║
║  │ 🎮           │  │ 🔥           │   ║
║  │ Classique ✓  │  │ Survie       │   ║
║  │ 10 niveaux,  │  │ Vie infinie, │   ║
║  │ 5 vies. Le   │  │ difficulté   │   ║
║  │ mode original│  │ croissante.  │   ║
║  │              │  │              │   ║
║  │ ❤️ 5         │  │ ♾️           │   ║
║  │              │  │              │   ║
║  │              │  │ 🔒 Niveau 3  │   ║
║  └──────────────┘  └──────────────┘   ║
║                                        ║
║  ┌──────────────┐  ┌──────────────┐   ║
║  │ ⏱️           │  │ 🧘           │   ║
║  │ Contre-la-   │  │ Zen          │   ║
║  │ Montre       │  │ Sans         │   ║
║  │ 120 secondes │  │ pression.    │   ║
║  │ pour scorer  │  │ Prenez votre │   ║
║  │ un maximum ! │  │ temps.       │   ║
║  │              │  │              │   ║
║  │ ♾️ ⏱️ 120s   │  │ ♾️           │   ║
║  │              │  │              │   ║
║  │ 🔒 Niveau 5  │  │ 🔒 Niveau 7  │   ║
║  └──────────────┘  └──────────────┘   ║
║                                        ║
║  ┌──────────────┐                     ║
║  │ ⚙️           │                     ║
║  │ Personnalisé │                     ║
║  │ Créez votre  │                     ║
║  │ propre défi !│                     ║
║  │              │                     ║
║  │ ❤️ 5         │                     ║
║  │              │                     ║
║  │ 🔒 500 XP •  │                     ║
║  │    100 🪙    │                     ║
║  └──────────────┘                     ║
║                                        ║
║  💡 Complétez les niveaux pour         ║
║     débloquer les modes !              ║
╚════════════════════════════════════════╝
```
*Avantage: Tous les modes visibles, progression claire*

---

## 🎬 Animation de Déblocage

```
╔════════════════════════════════════════╗
║                                        ║
║                                        ║
║          🎊   ✨   🎊   ✨            ║
║     ╔══════════════════════════╗       ║
║     ║                          ║       ║
║     ║  🎉 MODE DÉBLOQUÉ ! 🎉  ║       ║
║     ║                          ║       ║
║     ║         🔥                ║       ║
║     ║                          ║       ║
║     ║       SURVIE             ║       ║
║     ║                          ║       ║
║     ║  Vie infinie, difficulté ║       ║
║     ║  croissante. Jusqu'où    ║       ║
║     ║  irez-vous ?             ║       ║
║     ║                          ║       ║
║     ║   ┌──────────────────┐   ║       ║
║     ║   │ ✨ Nouveau ✨   │   ║       ║
║     ║   └──────────────────┘   ║       ║
║     ║                          ║       ║
║     ╚══════════════════════════╝       ║
║          ✨   🎊   ✨   🎊            ║
║                                        ║
║                                        ║
╚════════════════════════════════════════╝
```
*Animation avec effet glow pulsant et confettis*
*Auto-fermeture après 3 secondes*

---

## 📊 États des Cards

### Card Débloquée
```
┌──────────────┐
│ 🎮        ✓  │  ← Checkmark vert
│ Classique    │
│ 10 niveaux,  │
│ 5 vies       │
│              │
│ ❤️ 5         │
│              │
└──────────────┘
```
- Bordure verte (COLORS.success)
- Opacité 100%
- Cliquable

### Card Lockée (Niveau)
```
┌──────────────┐
│ 🔥           │
│ Survie       │  ← Texte grisé
│ Vie infinie  │
│              │
│ ♾️           │
│              │
│ ┌──────────┐ │
│ │🔒Niveau 3│ │  ← Badge lock
│ └──────────┘ │
└──────────────┘
```
- Bordure grise (COLORS.textSecondary)
- Opacité 60%
- Non cliquable

### Card Lockée (Ressources)
```
┌──────────────┐
│ ⚙️           │
│ Personnalisé │
│ Créez votre  │
│ propre défi  │
│              │
│ ❤️ 5         │
│              │
│ ┌──────────┐ │
│ │🔒500 XP •│ │  ← Badge avec coût
│ │  100 🪙  │ │
│ └──────────┘ │
└──────────────┘
```
- Bordure grise
- Opacité 60%
- Badge affiche le coût

---

## 🎨 Palette de Couleurs

### Modes Débloqués
- **Classique**: `#4A90E2` (Bleu)
- **Survie**: `#FF6B6B` (Rouge)
- **Time Attack**: `#FFB84D` (Orange)
- **Zen**: `#95E1D3` (Turquoise)
- **Custom**: `#A29BFE` (Violet)

### États
- **Bordure débloquée**: `COLORS.success` (#4CAF50)
- **Bordure lockée**: `COLORS.textSecondary` (#999)
- **Fond card**: `COLORS.surface` (#FFF)
- **Background**: Gradient `COLORS.primary` → `COLORS.secondary`

---

## 📐 Dimensions

### Grid Layout
- **2 colonnes** sur la largeur de l'écran
- **Gap**: SPACING.md (12px)
- **Padding horizontal**: SPACING.md
- **Card width**: `(SCREEN_WIDTH - SPACING.md * 3) / 2`
- **Min height**: 160px

### Typographie
- **Icône**: 40px
- **Titre**: FONT_SIZE.md, bold
- **Description**: 10px, line-height 14px
- **Features**: 11px, semibold
- **Lock badge**: 9px

---

## 🔄 Responsive

### Petit écran (< 360px)
- Cards restent visibles
- Texte description peut wrap
- Min height maintenu

### Grand écran (> 400px)
- Cards plus espacées
- Texte plus aéré
- Meilleure lisibilité

---

**Design inspiré des cards Succès pour cohérence visuelle !** 🎨
