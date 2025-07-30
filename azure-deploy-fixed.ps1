# Azure Frontend Deployment Script - PowerShell Version
# This script follows the same pattern as backend deployment

# Configuration
$RESOURCE_GROUP = "Data_base"
$PLAN_NAME = "novizit-frontend-plan"
$APP_NAME = "novizit-frontend-web"
$LOCATION = "Central India"
$RUNTIME = "NODE:22-lts"

Write-Host "🚀 Starting Azure Frontend Deployment..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    az --version | Out-Null
    Write-Host "✅ Azure CLI is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if user is logged in
try {
    az account show | Out-Null
    Write-Host "✅ Azure CLI is ready" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Please log in to Azure CLI first:" -ForegroundColor Yellow
    az login
}

# Create App Service plan if it doesn't exist
Write-Host "📋 Creating App Service plan..." -ForegroundColor Yellow
az appservice plan create `
    --name $PLAN_NAME `
    --resource-group $RESOURCE_GROUP `
    --sku B1 `
    --is-linux `
    --output none

# Create web app if it doesn't exist
Write-Host "🌐 Creating web app..." -ForegroundColor Yellow
az webapp create `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --plan $PLAN_NAME `
    --runtime $RUNTIME `
    --deployment-local-git `
    --output none

# Configure app settings
Write-Host "⚙️  Configuring app settings..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --settings `
    NODE_ENV="production" `
    NEXT_TELEMETRY_DISABLED="1" `
    WEBSITE_NODE_DEFAULT_VERSION="22.15.0" `
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" `
    BUILD_FLAGS="--platform nodejs --platform-version 22.15.0" `
    WEBSITES_PORT="8080" `
    --output none

# Set startup command
Write-Host "🚀 Setting startup command..." -ForegroundColor Yellow
az webapp config set `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --startup-file "npm start" `
    --output none

# Get the git deployment URL
Write-Host "🔗 Getting deployment URL..." -ForegroundColor Yellow
$GIT_URL = az webapp deployment source config-local-git `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --query url `
    --output tsv

Write-Host "Git deployment URL: $GIT_URL" -ForegroundColor Cyan

# Initialize git if not already done
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for Azure deployment"
}

# Add Azure remote
Write-Host "🔗 Adding Azure remote..." -ForegroundColor Yellow
git remote remove azure 2>$null
git remote add azure $GIT_URL

# Push to Azure
Write-Host "🚀 Deploying to Azure..." -ForegroundColor Yellow
git push azure main --force

# Get the app URL
$APP_URL = az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your app is available at: https://$APP_URL" -ForegroundColor Green

# Health check
Write-Host "🔍 Performing health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 45  # Wait for deployment to complete

try {
    $response = Invoke-WebRequest -Uri "https://$APP_URL" -UseBasicParsing -TimeoutSec 30
    Write-Host "✅ Health check passed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Health check failed - the app might still be starting up" -ForegroundColor Yellow
    Write-Host "📝 Check the logs: az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME" -ForegroundColor Yellow
}

Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
Write-Host "📝 You can monitor your app at: https://portal.azure.com" -ForegroundColor Yellow 