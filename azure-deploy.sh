#!/bin/bash

# Azure Frontend Deployment Script
# This script deploys the Next.js frontend to Azure App Service

set -e  # Exit on any error

# Configuration
RESOURCE_GROUP="novizit-frontend-rg"
PLAN_NAME="novizit-frontend-plan"
APP_NAME="novizit-frontend-web"
LOCATION="Central India"
RUNTIME="NODE:22-lts"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Azure Frontend Deployment...${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please log in to Azure CLI first:${NC}"
    az login
fi

echo -e "${GREEN}✅ Azure CLI is ready${NC}"

# Create resource group if it doesn't exist
echo -e "${YELLOW}📦 Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location "$LOCATION" --output none

# Create App Service plan if it doesn't exist
echo -e "${YELLOW}📋 Creating App Service plan...${NC}"
az appservice plan create \
    --name $PLAN_NAME \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux \
    --output none

# Create web app if it doesn't exist
echo -e "${YELLOW}🌐 Creating web app...${NC}"
az webapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $PLAN_NAME \
    --runtime $RUNTIME \
    --deployment-local-git \
    --output none

# Configure app settings
echo -e "${YELLOW}⚙️  Configuring app settings...${NC}"
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
    NODE_ENV="production" \
    NEXT_TELEMETRY_DISABLED="1" \
    WEBSITE_NODE_DEFAULT_VERSION="22.15.0" \
    WEBSITE_RUN_FROM_PACKAGE="1" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    BUILD_FLAGS="--platform nodejs --platform-version 22.15.0" \
    --output none

# Set the API URL dynamically
API_URL=$(az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv)
if [ ! -z "$API_URL" ]; then
    echo -e "${YELLOW}🔗 Setting API URL...${NC}"
    az webapp config appsettings set \
        --resource-group $RESOURCE_GROUP \
        --name $APP_NAME \
        --settings NEXT_PUBLIC_API_URL="https://$API_URL" \
        --output none
fi

# Navigate to frontend directory
cd frontend

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf .next
rm -rf node_modules
rm -f deployment.zip

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --only=production

# Build the application
echo -e "${YELLOW}🔨 Building the application...${NC}"
npm run build

# Verify the build was successful
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Build failed - .next directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
zip -r deployment.zip . \
    -x "node_modules/*" \
    -x ".git/*" \
    -x "*.log" \
    -x "coverage/*" \
    -x ".env*" \
    -x "deployment.zip" \
    -x ".next/cache/*"

# Deploy to Azure
echo -e "${YELLOW}🚀 Deploying to Azure...${NC}"
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --src deployment.zip \
    --output none

# Get the app URL
APP_URL=$(az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv)

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app is available at: https://$APP_URL${NC}"

# Health check
echo -e "${YELLOW}🔍 Performing health check...${NC}"
sleep 30  # Wait for deployment to complete

if curl -f -s "https://$APP_URL" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed - the app might still be starting up${NC}"
fi

echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo -e "${YELLOW}📝 You can monitor your app at: https://portal.azure.com${NC}" 