# Azure App Service Deployment Script (PowerShell)
# This script deploys the frontend to Azure App Service

param(
    [string]$ResourceGroup = "Data_base",
    [string]$AppServiceName = "real-estate-frontend",
    [string]$Location = "East US",
    [string]$Sku = "B1",
    [string]$Runtime = "NODE|18-lts"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "🚀 Starting Azure App Service Deployment" -ForegroundColor $Green

# Check if Azure CLI is installed
try {
    $null = Get-Command az -ErrorAction Stop
} catch {
    Write-Host "❌ Azure CLI is not installed. Please install it first." -ForegroundColor $Red
    exit 1
}

# Check if user is logged in
try {
    $null = az account show 2>$null
} catch {
    Write-Host "⚠️  Please log in to Azure first:" -ForegroundColor $Yellow
    az login
}

Write-Host "✅ Azure CLI is ready" -ForegroundColor $Green

# Create resource group if it doesn't exist
Write-Host "📦 Creating resource group..." -ForegroundColor $Yellow
az group create --name $ResourceGroup --location $Location --output none

# Create App Service plan if it doesn't exist
Write-Host "📋 Creating App Service plan..." -ForegroundColor $Yellow
az appservice plan create `
    --name "${AppServiceName}-plan" `
    --resource-group $ResourceGroup `
    --sku $Sku `
    --is-linux `
    --output none

# Create App Service if it doesn't exist
Write-Host "🌐 Creating App Service..." -ForegroundColor $Yellow
az webapp create `
    --name $AppServiceName `
    --resource-group $ResourceGroup `
    --plan "${AppServiceName}-plan" `
    --runtime $Runtime `
    --deployment-local-git `
    --output none

# Configure environment variables
Write-Host "⚙️  Configuring environment variables..." -ForegroundColor $Yellow

# Set Node.js version
az webapp config set `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --linux-fx-version "NODE|18-lts" `
    --output none

# Set startup command
az webapp config set `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --startup-file "npm start" `
    --output none

# Enable logging
az webapp log config `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --web-server-logging filesystem `
    --output none

Write-Host "✅ App Service configuration complete" -ForegroundColor $Green

# Build and deploy
Write-Host "🔨 Building application..." -ForegroundColor $Yellow

# Build the application
npm run build

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor $Yellow
Compress-Archive -Path * -DestinationPath deployment.zip -Force -Exclude @("node_modules/*", ".git/*", "*.log", "coverage/*", ".env*", "src/*", ".next/*")

# Deploy to Azure
Write-Host "🚀 Deploying to Azure App Service..." -ForegroundColor $Yellow
az webapp deployment source config-zip `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --src deployment.zip `
    --output none

# Clean up deployment package
Remove-Item deployment.zip -Force

# Get the app URL
$AppUrl = az webapp show --resource-group $ResourceGroup --name $AppServiceName --query defaultHostName --output tsv

Write-Host "✅ Deployment successful!" -ForegroundColor $Green
Write-Host "🌐 Your app is available at: https://$AppUrl" -ForegroundColor $Green
Write-Host "🔗 Health check: https://$AppUrl" -ForegroundColor $Green

# Display next steps
Write-Host "📋 Next steps:" -ForegroundColor $Yellow
Write-Host "1. Configure environment variables in Azure App Service"
Write-Host "2. Set up custom domain if needed"
Write-Host "3. Configure Azure CDN for better performance"
Write-Host "4. Set up monitoring and logging"
Write-Host "5. Configure SSL certificates"

Write-Host "🎉 Deployment script completed!" -ForegroundColor $Green 