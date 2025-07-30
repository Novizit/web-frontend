# Azure Frontend Deployment Script for Windows
# This script deploys the Next.js frontend to Azure App Service

param(
    [string]$ResourceGroup = "real-estate-platform-rg",
    [string]$AppName = "real-estate-frontend",
    [string]$PlanName = "real-estate-frontend-plan",
    [string]$Location = "East US",
    [string]$Runtime = "NODE|18-lts"
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "🚀 Starting Azure Frontend Deployment..."

# Check if Azure CLI is installed
try {
    $null = Get-Command az -ErrorAction Stop
} catch {
    Write-ColorOutput Red "❌ Azure CLI is not installed. Please install it first."
    exit 1
}

# Check if logged in to Azure
try {
    $null = az account show 2>$null
} catch {
    Write-ColorOutput Yellow "⚠️  Not logged in to Azure. Please run 'az login' first."
    exit 1
}

Write-ColorOutput Green "✅ Azure CLI is ready"

# Create resource group if it doesn't exist
Write-ColorOutput Yellow "📦 Creating resource group..."
az group create --name $ResourceGroup --location $Location --output none

# Create App Service Plan if it doesn't exist
Write-ColorOutput Yellow "📋 Creating App Service Plan..."
az appservice plan create `
    --name $PlanName `
    --resource-group $ResourceGroup `
    --sku B1 `
    --is-linux `
    --output none

# Create App Service if it doesn't exist
Write-ColorOutput Yellow "🌐 Creating App Service..."
az webapp create `
    --name $AppName `
    --resource-group $ResourceGroup `
    --plan $PlanName `
    --runtime $Runtime `
    --deployment-local-git `
    --output none

# Configure environment variables
Write-ColorOutput Yellow "⚙️  Configuring environment variables..."
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --settings `
        NODE_ENV="production" `
        NEXT_TELEMETRY_DISABLED="1" `
        WEBSITE_NODE_DEFAULT_VERSION="18.17.0" `
        WEBSITE_RUN_FROM_PACKAGE="1" `
    --output none

# Get backend URL for API configuration
try {
    $BackendUrl = az webapp show `
        --resource-group $ResourceGroup `
        --name "real-estate-backend" `
        --query "defaultHostName" `
        --output tsv 2>$null
} catch {
    $BackendUrl = "real-estate-backend.azurewebsites.net"
}

# Set API URL
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --settings `
        NEXT_PUBLIC_API_URL="https://$BackendUrl/api" `
    --output none

Write-ColorOutput Green "✅ Environment variables configured"

# Install dependencies
Write-ColorOutput Yellow "📦 Installing dependencies..."
npm ci --only=production

# Build the application
Write-ColorOutput Yellow "🔨 Building the application..."
npm run build

# Create deployment package
Write-ColorOutput Yellow "📦 Creating deployment package..."
if (Test-Path "deployment.zip") {
    Remove-Item "deployment.zip" -Force
}

# Create zip file excluding unnecessary files
$compress = @{
    Path = Get-ChildItem -Path . -Exclude @("node_modules", ".git", "*.log", "coverage", ".env*", ".next", "deployment.zip")
    CompressionLevel = "Optimal"
    DestinationPath = "deployment.zip"
}
Compress-Archive @compress

# Deploy to Azure
Write-ColorOutput Yellow "🚀 Deploying to Azure..."
az webapp deployment source config-zip `
    --resource-group $ResourceGroup `
    --name $AppName `
    --src deployment.zip `
    --output none

# Clean up
Remove-Item "deployment.zip" -Force

# Get the app URL
$AppUrl = az webapp show `
    --resource-group $ResourceGroup `
    --name $AppName `
    --query "defaultHostName" `
    --output tsv

Write-ColorOutput Green "✅ Deployment completed successfully!"
Write-ColorOutput Green "🌐 Your app is available at: https://$AppUrl"

$SubscriptionId = az account show --query id -o tsv
Write-ColorOutput Yellow "📊 Monitor your app at: https://portal.azure.com/#@/resource/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$AppName"

# Health check
Write-ColorOutput Yellow "🔍 Performing health check..."
Start-Sleep -Seconds 10
try {
    $response = Invoke-WebRequest -Uri "https://$AppUrl" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-ColorOutput Green "✅ Health check passed!"
    } else {
        Write-ColorOutput Yellow "⚠️  Health check failed. The app might still be starting up."
    }
} catch {
    Write-ColorOutput Yellow "⚠️  Health check failed. The app might still be starting up."
} 