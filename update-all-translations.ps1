# Script pour mettre à jour toutes les traductions avec les cl és manquantes
Write-Host "Mise à jour des traductions..." -ForegroundColor Cyan

# Liste des fichiers à mettre à jour (tous sauf fr.json qui est déjà fait)
$languages = @("en", "es", "de", "ja", "ar", "zh", "pt")

Write-Host "`nLes clés suivantes ont été ajoutées au français:" -ForegroundColor Yellow
Write-Host "- home: subtitle, play, leaderboard, challenges, friends, profile, settings, dailyChallenge, challengeTarget, completed, highScore, maxLevel, gamesPlayed"
Write-Host "- profile: themes, visualEffects, particles, confetti, glowEffects, shakeEffects, earnRewards, highScore, maxLevel, gamesPlayed, unlockedAchievements, noAchievements, signOut, signingOut, signOutConfirm, profileUpdated, anonymousInfo, anonymousTip"
Write-Host "- settings: soundDescription, hapticsDescription"
Write-Host "- game: memorizeSequence, memorizeFocusShapes, yourTurn, clickShapesInOrder, ready, excellent, tryAgain, level5-30"
Write-Host "- errors: signOutFailed"

Write-Host "`nVeuillez mettre à jour manuellement les autres fichiers de langue dans:" -ForegroundColor Green
Write-Host "c:\MemoryMatrix\src\services\locales\" -ForegroundColor White

foreach ($lang in $languages) {
    Write-Host "`n- $lang.json" -ForegroundColor Cyan
}

Write-Host "`nUtilisez les traductions du fichier fr.json comme référence." -ForegroundColor Yellow
Write-Host "IMPORTANT: Assurez-vous que toutes les clés sont présentes dans TOUS les fichiers!" -ForegroundColor Red
