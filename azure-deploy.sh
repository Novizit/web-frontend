#!/bin/bash

# Azure Frontend Deployment Script
# This script deploys the Next.js frontend to Azure App Service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="real-estate-platform-rg"
APP_NAME="real-estate-frontend"
PLAN_NAME="real-estate-frontend-plan"
LOCATION="East US"
RUNTIME="NODE|18-lts"

echo -e "${GREEN}🚀 Starting Azure Frontend Deployment...${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Please run 'az login' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Azure CLI is ready${NC}"

# Create resource group if it doesn't exist
echo -e "${YELLOW}📦 Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location "$LOCATION" --output none

# Create App Service Plan if it doesn't exist
echo -e "${YELLOW}📋 Creating App Service Plan...${NC}"
az appservice plan create \
    --name $PLAN_NAME \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux \
    --output none

# Create App Service if it doesn't exist
echo -e "${YELLOW}🌐 Creating App Service...${NC}"
az webapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $PLAN_NAME \
    --runtime $RUNTIME \
    --deployment-local-git \
    --output none

# Configure environment variables
echo -e "${YELLOW}⚙️  Configuring environment variables...${NC}"
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        NODE_ENV="production" \
        NEXT_TELEMETRY_DISABLED="1" \
        WEBSITE_NODE_DEFAULT_VERSION="18.17.0" \
        WEBSITE_RUN_FROM_PACKAGE="1" \
    --output none

# Get backend URL for API configuration
BACKEND_URL=$(az webapp show \
    --resource-group $RESOURCE_GROUP \
    --name "real-estate-backend" \
    --query "defaultHostName" \
    --output tsv 2>/dev/null || echo "real-estate-backend.azurewebsites.net")

# Set API URL
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        NEXT_PUBLIC_API_URL="https://$BACKEND_URL/api" \
    --output none

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --only=production

# Build the application
echo -e "${YELLOW}🔨 Building the application...${NC}"
npm run build

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
zip -r deployment.zip . \
    -x "node_modules/*" \
    ".git/*" \
    "*.log" \
    "coverage/*" \
    ".env*" \
    ".next/*" \
    "deployment.zip"

# Deploy to Azure
echo -e "${YELLOW}🚀 Deploying to Azure...${NC}"
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --src deployment.zip \
    --output none

# Clean up
rm deployment.zip

# Get the app URL
APP_URL=$(az webapp show \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --query "defaultHostName" \
    --output tsv)

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app is available at: https://$APP_URL${NC}"
echo -e "${YELLOW}📊 Monitor your app at: https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$APP_NAME${NC}"

# Health check
echo -e "${YELLOW}🔍 Performing health check...${NC}"
sleep 10
if curl -f "https://$APP_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed. The app might still be starting up.${NC}"
fi 