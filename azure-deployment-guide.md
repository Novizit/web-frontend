# Frontend Azure Deployment Guide

This guide provides step-by-step instructions for deploying the Next.js frontend to Azure App Service.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   Backend       │
│   (Next.js)     │    │   (Node.js)     │
│   Azure App     │    │   Azure App     │
│   Service       │    │   Service       │
└─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

1. **Azure Account** with active subscription
2. **Azure CLI** installed and configured
3. **Node.js 18+** for local development
4. **Git** for version control

## 🚀 Quick Deployment

### Option 1: Automated Scripts

#### For Linux/macOS:
```bash
cd frontend
chmod +x azure-deploy.sh
./azure-deploy.sh
```

#### For Windows:
```powershell
cd frontend
.\azure-deploy.ps1
```

### Option 2: Manual Deployment

#### Step 1: Create Azure Resources

```bash
# Create resource group
az group create --name real-estate-platform-rg --location "East US"

# Create App Service Plan
az appservice plan create \
  --name real-estate-frontend-plan \
  --resource-group real-estate-platform-rg \
  --sku B1 \
  --is-linux

# Create App Service
az webapp create \
  --name real-estate-frontend \
  --resource-group real-estate-platform-rg \
  --plan real-estate-frontend-plan \
  --runtime "NODE|18-lts"
```

#### Step 2: Configure Environment Variables

```bash
az webapp config appsettings set \
  --resource-group real-estate-platform-rg \
  --name real-estate-frontend \
  --settings \
    NODE_ENV="production" \
    NEXT_TELEMETRY_DISABLED="1" \
    WEBSITE_NODE_DEFAULT_VERSION="18.17.0" \
    WEBSITE_RUN_FROM_PACKAGE="1" \
    NEXT_PUBLIC_API_URL="https://real-estate-backend.azurewebsites.net/api"
```

#### Step 3: Deploy Application

```bash
cd frontend

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Create deployment package
zip -r deployment.zip . \
  -x "node_modules/*" \
  ".git/*" \
  "*.log" \
  "coverage/*" \
  ".env*" \
  ".next/*" \
  "deployment.zip"

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group real-estate-platform-rg \
  --name real-estate-frontend \
  --src deployment.zip

# Clean up
rm deployment.zip
```

## 🔧 CI/CD Pipeline Setup

### Azure DevOps Pipeline

1. **Create Azure DevOps Project**
2. **Import Repository**
3. **Create Pipeline** using `azure-pipelines.yml`
4. **Configure Service Connections**
5. **Set Environment Variables**

### GitHub Actions

1. **Add Repository Secrets**:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`
   - `AZURE_WEBAPP_STAGING_PUBLISH_PROFILE`

2. **Enable GitHub Actions** using `.github/workflows/deploy.yml`

## 📊 Monitoring and Health Checks

### Application Logs
```bash
# View real-time logs
az webapp log tail --resource-group real-estate-platform-rg --name real-estate-frontend

# Download logs
az webapp log download --resource-group real-estate-platform-rg --name real-estate-frontend
```

### Health Check
```bash
# Get app URL
APP_URL=$(az webapp show \
  --resource-group real-estate-platform-rg \
  --name real-estate-frontend \
  --query "defaultHostName" \
  --output tsv)

# Test health
curl -f "https://$APP_URL"
```

## 🔒 Security Configuration

### Environment Variables
```bash
# Production settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
WEBSITE_NODE_DEFAULT_VERSION=18.17.0
WEBSITE_RUN_FROM_PACKAGE=1
NEXT_PUBLIC_API_URL=https://your-backend-app.azurewebsites.net/api
```

### Security Headers
The application includes security headers in `next.config.ts`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
az webapp log download --resource-group real-estate-platform-rg --name real-estate-frontend

# Verify Node.js version
az webapp config appsettings list --resource-group real-estate-platform-rg --name real-estate-frontend
```

#### 2. Runtime Errors
```bash
# Check application logs
az webapp log tail --resource-group real-estate-platform-rg --name real-estate-frontend

# Restart application
az webapp restart --resource-group real-estate-platform-rg --name real-estate-frontend
```

#### 3. API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check backend service availability
- Ensure CORS is properly configured

#### 4. Static Asset Issues
- Verify `public` folder is included in deployment
- Check image optimization settings in `next.config.ts`
- Ensure Azure Blob Storage domain is whitelisted

### Performance Optimization

#### 1. Enable Compression
```bash
az webapp config set \
  --resource-group real-estate-platform-rg \
  --name real-estate-frontend \
  --generic-configurations '{"http20Enabled": true}'
```

#### 2. Configure Caching
```bash
az webapp config appsettings set \
  --resource-group real-estate-platform-rg \
  --name real-estate-frontend \
  --settings \
    WEBSITE_DYNAMIC_CACHE="1"
```

## 📈 Scaling

### Vertical Scaling (Upgrade Plan)
```bash
az appservice plan update \
  --name real-estate-frontend-plan \
  --resource-group real-estate-platform-rg \
  --sku S1
```

### Horizontal Scaling (Add Instances)
```bash
az appservice plan update \
  --name real-estate-frontend-plan \
  --resource-group real-estate-platform-rg \
  --number-of-workers 3
```

## 🔄 Deployment Strategies

### Blue-Green Deployment
1. Deploy to staging environment
2. Run tests and validation
3. Swap staging and production slots

### Rolling Deployment
1. Deploy to multiple instances gradually
2. Monitor health checks
3. Rollback if issues detected

## 💰 Cost Optimization

1. **Use Basic (B1) plan** for development
2. **Scale down** during off-hours
3. **Use Azure Reserved Instances** for production
4. **Monitor usage** with Azure Cost Management
5. **Clean up unused resources**

## 📚 Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Azure CLI Documentation](https://docs.microsoft.com/en-us/cli/azure/)
- [Azure DevOps Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/)

## 🆘 Support

For deployment issues:
1. Check Azure App Service logs
2. Review application logs
3. Verify environment variables
4. Test locally with production settings
5. Create support ticket in Azure portal 