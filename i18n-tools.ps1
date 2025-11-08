# Memory Matrix - Scripts i18n PowerShell
# Automatisation des tâches courantes d'internationalisation

Write-Host "🌍 Memory Matrix - Scripts i18n" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Choisissez une option:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1.  ✅ Vérifier compilation TypeScript"
    Write-Host "2.  🔍 Rechercher strings hardcodées"
    Write-Host "3.  📊 Compter strings par langue"
    Write-Host "4.  🔧 Vérifier cohérence des clés"
    Write-Host "5.  🏗️  Build APK Debug"
    Write-Host "6.  🚀 Build APK Release"
    Write-Host "7.  📱 Lancer app sur Android"
    Write-Host "8.  🧹 Clean cache et rebuild"
    Write-Host "9.  📝 Lister écrans à migrer"
    Write-Host "10. 🌐 Tester langue système device"
    Write-Host "0.  ❌ Quitter"
    Write-Host ""
}

function Test-TypeScript {
    Write-Host "🔍 Vérification TypeScript..." -ForegroundColor Cyan
    npx tsc --noEmit
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Compilation OK!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreurs de compilation détectées" -ForegroundColor Red
    }
}

function Find-HardcodedStrings {
    Write-Host "🔍 Recherche de strings hardcodées..." -ForegroundColor Cyan
    Write-Host ""
    
    $patterns = @("Jouer", "Niveau", "Score", "Défis", "Profil", "Paramètres", "Classement")
    $found = $false
    
    foreach ($pattern in $patterns) {
        $results = Get-ChildItem -Path "src/screens" -Filter "*.tsx" -Recurse | 
                   Select-String -Pattern $pattern -CaseSensitive
        
        if ($results) {
            $found = $true
            Write-Host "⚠️  Trouvé '$pattern' dans:" -ForegroundColor Yellow
            foreach ($result in $results) {
                Write-Host "   $($result.Path):$($result.LineNumber)" -ForegroundColor Gray
            }
            Write-Host ""
        }
    }
    
    if (-not $found) {
        Write-Host "✅ Aucune string hardcodée trouvée!" -ForegroundColor Green
    }
}

function Count-TranslationStrings {
    Write-Host "📊 Comptage des strings par langue..." -ForegroundColor Cyan
    Write-Host ""
    
    $localesPath = "src/services/locales"
    $files = Get-ChildItem -Path $localesPath -Filter "*.json"
    
    $totalStrings = 0
    
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw | ConvertFrom-Json
        $count = ($content | ConvertTo-Json -Depth 100 -Compress | 
                  Select-String -Pattern '":"' -AllMatches).Matches.Count
        
        $flag = switch ($file.BaseName) {
            "fr" { "🇫🇷" }
            "en" { "🇬🇧" }
            "es" { "🇪🇸" }
            "de" { "🇩🇪" }
            "ja" { "🇯🇵" }
            "ar" { "🇸🇦" }
            "zh" { "🇨🇳" }
            "pt" { "🇵🇹" }
            default { "🏳️" }
        }
        
        Write-Host "$flag $($file.BaseName).json: " -NoNewline
        Write-Host "$count strings" -ForegroundColor Green
        
        $totalStrings += $count
    }
    
    Write-Host ""
    Write-Host "TOTAL: $totalStrings strings ($(8) langues)" -ForegroundColor Cyan
}

function Check-KeyConsistency {
    Write-Host "🔧 Vérification de la cohérence des clés..." -ForegroundColor Cyan
    Write-Host ""
    
    $frPath = "src/services/locales/fr.json"
    $frContent = Get-Content -Path $frPath -Raw | ConvertFrom-Json
    $frKeys = $frContent.PSObject.Properties.Name | Sort-Object
    
    $languages = @("en", "es", "de", "ja", "ar", "zh", "pt")
    $allConsistent = $true
    
    foreach ($lang in $languages) {
        $langPath = "src/services/locales/$lang.json"
        $langContent = Get-Content -Path $langPath -Raw | ConvertFrom-Json
        $langKeys = $langContent.PSObject.Properties.Name | Sort-Object
        
        $frKeysStr = $frKeys -join ","
        $langKeysStr = $langKeys -join ","
        
        if ($frKeysStr -eq $langKeysStr) {
            Write-Host "✅ $lang.json - Cohérent avec fr.json" -ForegroundColor Green
        } else {
            Write-Host "❌ $lang.json - Incohérent!" -ForegroundColor Red
            $allConsistent = $false
        }
    }
    
    if ($allConsistent) {
        Write-Host ""
        Write-Host "✅ Toutes les langues sont cohérentes!" -ForegroundColor Green
    }
}

function Build-DebugAPK {
    Write-Host "🏗️  Build APK Debug..." -ForegroundColor Cyan
    
    Set-Location android
    ./gradlew assembleDebug
    Set-Location ..
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Build réussi!" -ForegroundColor Green
        Write-Host "📦 APK: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Build échoué" -ForegroundColor Red
    }
}

function Build-ReleaseAPK {
    Write-Host "🚀 Build APK Release..." -ForegroundColor Cyan
    
    Set-Location android
    ./gradlew assembleRelease
    Set-Location ..
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Build réussi!" -ForegroundColor Green
        Write-Host "📦 APK: android/app/build/outputs/apk/release/app-release.apk" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Build échoué" -ForegroundColor Red
    }
}

function Start-AndroidApp {
    Write-Host "📱 Lancement de l'app sur Android..." -ForegroundColor Cyan
    npm run android
}

function Clean-AndRebuild {
    Write-Host "🧹 Nettoyage et rebuild..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "1/4 Nettoyage Gradle..." -ForegroundColor Yellow
    Set-Location android
    ./gradlew clean
    Set-Location ..
    
    Write-Host "2/4 Suppression node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    
    Write-Host "3/4 Installation dépendances..." -ForegroundColor Yellow
    npm install
    
    Write-Host "4/4 Build Debug..." -ForegroundColor Yellow
    Set-Location android
    ./gradlew assembleDebug
    Set-Location ..
    
    Write-Host ""
    Write-Host "✅ Nettoyage et rebuild terminés!" -ForegroundColor Green
}

function List-ScreensToMigrate {
    Write-Host "📝 Écrans à migrer..." -ForegroundColor Cyan
    Write-Host ""
    
    $screens = @(
        @{ Name = "SettingsScreen"; Priority = "🔴 Haute"; Status = "⏳ À faire" },
        @{ Name = "HomeScreen"; Priority = "🔴 Haute"; Status = "⏳ À faire" },
        @{ Name = "GameScreen"; Priority = "🟡 Moyenne"; Status = "⏳ À faire" },
        @{ Name = "FriendChallengesScreen"; Priority = "🟡 Moyenne"; Status = "⏳ À faire" },
        @{ Name = "ChallengesScreen"; Priority = "🟡 Moyenne"; Status = "⏳ À faire" },
        @{ Name = "ProfileScreen"; Priority = "🟢 Normale"; Status = "⏳ À faire" },
        @{ Name = "LeaderboardScreen"; Priority = "🟢 Normale"; Status = "⏳ À faire" },
        @{ Name = "OnboardingScreen"; Priority = "🟢 Normale"; Status = "⏳ À faire" },
        @{ Name = "GameOverScreen"; Priority = "🟢 Normale"; Status = "⏳ À faire" },
        @{ Name = "FriendsScreen"; Priority = "🟢 Normale"; Status = "⏳ À faire" }
    )
    
    foreach ($screen in $screens) {
        Write-Host "$($screen.Status) " -NoNewline
        Write-Host "$($screen.Name) " -NoNewline -ForegroundColor White
        Write-Host "- $($screen.Priority)"
    }
    
    Write-Host ""
    Write-Host "Total: 10 écrans à migrer" -ForegroundColor Cyan
}

function Test-DeviceLocale {
    Write-Host "🌐 Test de la langue système du device..." -ForegroundColor Cyan
    Write-Host ""
    
    $devices = adb devices
    if ($devices -match "device$") {
        Write-Host "📱 Device connecté détecté" -ForegroundColor Green
        Write-Host ""
        
        $locale = adb shell getprop persist.sys.locale
        Write-Host "Langue actuelle: $locale" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "Voulez-vous changer la langue du device? (o/n)" -ForegroundColor Yellow
        $change = Read-Host
        
        if ($change -eq "o") {
            Write-Host ""
            Write-Host "Choisissez une langue:" -ForegroundColor Yellow
            Write-Host "1. Français (fr-FR)"
            Write-Host "2. English (en-US)"
            Write-Host "3. Español (es-ES)"
            Write-Host "4. Deutsch (de-DE)"
            Write-Host "5. 日本語 (ja-JP)"
            Write-Host "6. العربية (ar-SA)"
            Write-Host "7. 中文 (zh-CN)"
            Write-Host "8. Português (pt-PT)"
            
            $choice = Read-Host "Choix"
            
            $newLocale = switch ($choice) {
                "1" { "fr-FR" }
                "2" { "en-US" }
                "3" { "es-ES" }
                "4" { "de-DE" }
                "5" { "ja-JP" }
                "6" { "ar-SA" }
                "7" { "zh-CN" }
                "8" { "pt-PT" }
                default { $null }
            }
            
            if ($newLocale) {
                Write-Host "⚠️  Attention: Cela va redémarrer le device!" -ForegroundColor Red
                Write-Host "Continuer? (o/n)" -ForegroundColor Yellow
                $confirm = Read-Host
                
                if ($confirm -eq "o") {
                    adb shell "setprop persist.sys.locale $newLocale && stop && start"
                    Write-Host "✅ Langue changée en $newLocale" -ForegroundColor Green
                }
            }
        }
    } else {
        Write-Host "❌ Aucun device Android connecté" -ForegroundColor Red
        Write-Host "Connectez un device ou lancez un émulateur" -ForegroundColor Yellow
    }
}

# Menu principal
do {
    Show-Menu
    $choice = Read-Host "Votre choix"
    Write-Host ""
    
    switch ($choice) {
        "1" { Test-TypeScript }
        "2" { Find-HardcodedStrings }
        "3" { Count-TranslationStrings }
        "4" { Check-KeyConsistency }
        "5" { Build-DebugAPK }
        "6" { Build-ReleaseAPK }
        "7" { Start-AndroidApp }
        "8" { Clean-AndRebuild }
        "9" { List-ScreensToMigrate }
        "10" { Test-DeviceLocale }
        "0" { 
            Write-Host "👋 Au revoir!" -ForegroundColor Cyan
            break 
        }
        default { 
            Write-Host "❌ Option invalide" -ForegroundColor Red 
        }
    }
    
    if ($choice -ne "0") {
        Write-Host ""
        Write-Host "Appuyez sur Entrée pour continuer..." -ForegroundColor Gray
        Read-Host
        Clear-Host
    }
    
} while ($choice -ne "0")
