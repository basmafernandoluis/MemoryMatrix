# Script de Build Local - Memory Matrix
# Automatise le processus de build et test

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'clean', 'apk', 'start')]
    [string]$Mode = 'dev'
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Memory Matrix - Build Local" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Sélectionnez le mode de build :" -ForegroundColor Yellow
    Write-Host "  1. Build Développement (run:android)" -ForegroundColor White
    Write-Host "  2. Build Clean (avec cache clear)" -ForegroundColor White
    Write-Host "  3. Start Server Uniquement" -ForegroundColor White
    Write-Host "  4. Build APK Production" -ForegroundColor White
    Write-Host "  5. Vérifier Connexion Téléphone" -ForegroundColor White
    Write-Host ""
}

function Test-DeviceConnected {
    Write-Host "🔍 Vérification de la connexion du téléphone..." -ForegroundColor Yellow
    
    $adbPath = Get-Command adb -ErrorAction SilentlyContinue
    
    if ($null -eq $adbPath) {
        Write-Host "❌ ADB n'est pas installé ou pas dans le PATH" -ForegroundColor Red
        Write-Host "   Installez Android Studio et configurez le SDK" -ForegroundColor Yellow
        return $false
    }
    
    $devices = adb devices | Select-String "device$"
    
    if ($devices.Count -eq 0) {
        Write-Host "❌ Aucun appareil détecté" -ForegroundColor Red
        Write-Host "   - Connectez votre téléphone via USB" -ForegroundColor Yellow
        Write-Host "   - Activez le mode développeur" -ForegroundColor Yellow
        Write-Host "   - Activez le débogage USB" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "✅ Appareil(s) détecté(s):" -ForegroundColor Green
    adb devices
    return $true
}

function Build-Dev {
    Write-Host "🚀 Lancement du build de développement..." -ForegroundColor Cyan
    Write-Host ""
    
    # Vérifier les assets
    if (-not (Test-Path ".\assets\icon.png")) {
        Write-Host "⚠️  Warning: icon.png manquant dans assets/" -ForegroundColor Yellow
    }
    if (-not (Test-Path ".\assets\adaptive-icon.png")) {
        Write-Host "⚠️  Warning: adaptive-icon.png manquant dans assets/" -ForegroundColor Yellow
    }
    if (-not (Test-Path ".\assets\splash.png")) {
        Write-Host "⚠️  Warning: splash.png manquant dans assets/" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "📦 Démarrage de npx expo run:android..." -ForegroundColor Magenta
    Write-Host "   Cela peut prendre 3-5 minutes..." -ForegroundColor Gray
    Write-Host ""
    
    npx expo run:android
}

function Build-Clean {
    Write-Host "🧹 Nettoyage du cache..." -ForegroundColor Cyan
    
    # Nettoyer les caches
    if (Test-Path ".expo") {
        Remove-Item -Recurse -Force .expo
        Write-Host "✅ Cache .expo supprimé" -ForegroundColor Green
    }
    
    if (Test-Path "node_modules\.cache") {
        Remove-Item -Recurse -Force node_modules\.cache
        Write-Host "✅ Cache node_modules supprimé" -ForegroundColor Green
    }
    
    if (Test-Path "android\app\build") {
        Remove-Item -Recurse -Force android\app\build
        Write-Host "✅ Build Android nettoyé" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "📦 Build clean..." -ForegroundColor Magenta
    npx expo run:android --clear
}

function Start-Server {
    Write-Host "🌐 Démarrage du serveur Expo..." -ForegroundColor Cyan
    Write-Host "   L'app doit déjà être installée sur le téléphone" -ForegroundColor Gray
    Write-Host ""
    
    npx expo start
}

function Build-APK {
    Write-Host "📦 Build APK Production..." -ForegroundColor Cyan
    
    # Vérifier si EAS CLI est installé
    $easCLI = Get-Command eas -ErrorAction SilentlyContinue
    
    if ($null -eq $easCLI) {
        Write-Host "❌ EAS CLI n'est pas installé" -ForegroundColor Red
        Write-Host ""
        Write-Host "Installation :" -ForegroundColor Yellow
        Write-Host "  npm install -g eas-cli" -ForegroundColor Cyan
        Write-Host "  eas login" -ForegroundColor Cyan
        Write-Host "  eas build --platform android --profile preview" -ForegroundColor Cyan
        return
    }
    
    Write-Host "🚀 Lancement du build EAS..." -ForegroundColor Magenta
    eas build --platform android --profile preview
}

# Menu interactif si aucun paramètre
if ($Mode -eq 'dev' -and $args.Count -eq 0) {
    Show-Menu
    $choice = Read-Host "Votre choix (1-5)"
    
    switch ($choice) {
        "1" { Build-Dev }
        "2" { Build-Clean }
        "3" { Start-Server }
        "4" { Build-APK }
        "5" { Test-DeviceConnected; Read-Host "Appuyez sur Entrée pour continuer" }
        default { Write-Host "❌ Choix invalide" -ForegroundColor Red }
    }
} else {
    # Exécution directe selon le mode
    switch ($Mode) {
        'dev' { Build-Dev }
        'clean' { Build-Clean }
        'start' { Start-Server }
        'apk' { Build-APK }
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Terminé !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
