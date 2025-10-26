# Script de déploiement des règles Firestore
# Memory Matrix - Phase 8

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Memory Matrix - Déploiement Règles Firestore" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Firebase CLI est installé
Write-Host "Vérification de Firebase CLI..." -ForegroundColor Yellow
$firebaseCLI = Get-Command firebase -ErrorAction SilentlyContinue

if ($null -eq $firebaseCLI) {
    Write-Host "❌ Firebase CLI n'est pas installé." -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour installer Firebase CLI :" -ForegroundColor White
    Write-Host "  npm install -g firebase-tools" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Alternative : Déployer manuellement via la Console Firebase" -ForegroundColor Yellow
    Write-Host "  1. Ouvrez https://console.firebase.google.com" -ForegroundColor White
    Write-Host "  2. Sélectionnez votre projet" -ForegroundColor White
    Write-Host "  3. Firestore Database → Règles" -ForegroundColor White
    Write-Host "  4. Copiez le contenu de firestore.rules" -ForegroundColor White
    Write-Host "  5. Cliquez sur Publier" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Firebase CLI trouvé : $($firebaseCLI.Version)" -ForegroundColor Green
Write-Host ""

# Vérifier si le fichier firestore.rules existe
if (-not (Test-Path "firestore.rules")) {
    Write-Host "❌ Le fichier firestore.rules n'existe pas !" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier firestore.rules trouvé" -ForegroundColor Green
Write-Host ""

# Afficher le contenu des règles
Write-Host "📋 Aperçu des règles à déployer :" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Get-Content "firestore.rules" | Select-Object -First 20
Write-Host "..." -ForegroundColor Gray
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Voulez-vous déployer ces règles Firestore ? (O/N)"
if ($confirmation -ne 'O' -and $confirmation -ne 'o') {
    Write-Host "❌ Déploiement annulé." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Déploiement en cours..." -ForegroundColor Cyan

# Déployer les règles
try {
    firebase deploy --only firestore:rules
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Règles Firestore déployées avec succès !" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Prochaines étapes :" -ForegroundColor Cyan
        Write-Host "  1. Redémarrez votre application Expo" -ForegroundColor White
        Write-Host "  2. Testez l'écran 'Défis Quotidiens'" -ForegroundColor White
        Write-Host "  3. Vérifiez qu'il n'y a plus d'erreur permission-denied" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
        Write-Host "Veuillez vérifier votre connexion et vos permissions Firebase" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur : $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
