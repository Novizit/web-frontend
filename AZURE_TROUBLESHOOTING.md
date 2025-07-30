# Azure Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. "next: not found" Error

**Problem**: The `next` command is not found when trying to start the application.

**Causes**:
- Build process didn't complete successfully
- Dependencies not properly installed
- Deployment package missing built application

**Solutions**:

#### Option A: Manual Deployment
```bash
# 1. Clean and rebuild locally
cd frontend
rm -rf .next node_modules
npm ci
npm run build

# 2. Create deployment package
zip -r deployment.zip . \
    -x "node_modules/*" \
    -x ".git/*" \
    -x "*.log" \
    -x "coverage/*" \
    -x ".env*" \
    -x "deployment.zip" \
    -x ".next/cache/*"

# 3. Deploy to Azure
az webapp deployment source config-zip \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web \
    --src deployment.zip
```

#### Option B: Use Azure CLI Deployment
```bash
# Deploy directly from local directory
az webapp deployment source config-local-git \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web

# Then push to the git remote
git remote add azure <git-url-from-above-command>
git push azure main
```

### 2. Build Failures

**Problem**: Build process fails during deployment.

**Solutions**:

1. **Check Node.js version**:
   ```bash
   # Ensure Azure uses Node.js 22
   az webapp config appsettings set \
       --resource-group novizit-frontend-rg \
       --name novizit-frontend-web \
       --settings WEBSITE_NODE_DEFAULT_VERSION="22.15.0"
   ```

2. **Enable build logs**:
   ```bash
   az webapp log tail \
       --resource-group novizit-frontend-rg \
       --name novizit-frontend-web
   ```

3. **Force rebuild**:
   ```bash
   # Clear build cache
   az webapp config appsettings set \
       --resource-group novizit-frontend-rg \
       --name novizit-frontend-web \
       --settings SCM_DO_BUILD_DURING_DEPLOYMENT="true"
   ```

### 3. Environment Variables

**Problem**: Application can't find required environment variables.

**Solution**:
```bash
# Set required environment variables
az webapp config appsettings set \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web \
    --settings \
    NODE_ENV="production" \
    NEXT_TELEMETRY_DISABLED="1" \
    NEXT_PUBLIC_API_URL="https://your-backend-url.azurewebsites.net/api"
```

### 4. Port Configuration

**Problem**: Application not listening on correct port.

**Solution**:
```bash
# Set the port configuration
az webapp config appsettings set \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web \
    --settings WEBSITES_PORT="8080"
```

### 5. Memory Issues

**Problem**: Application runs out of memory during build.

**Solution**:
```bash
# Increase memory allocation
az webapp config appsettings set \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web \
    --settings NODE_OPTIONS="--max-old-space-size=4096"
```

## Debugging Steps

### 1. Check Application Logs
```bash
# View real-time logs
az webapp log tail \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web

# Download logs
az webapp log download \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web
```

### 2. Check Application Status
```bash
# Get app status
az webapp show \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web \
    --query "state"
```

### 3. Restart Application
```bash
# Restart the web app
az webapp restart \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web
```

### 4. Check Build Status
```bash
# Check if build is in progress
az webapp deployment list \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web
```

## Quick Fix Commands

### Complete Reset and Redeploy
```bash
# 1. Stop the app
az webapp stop \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web

# 2. Clear all settings
az webapp config appsettings delete \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web \
    --setting-names NODE_ENV NEXT_TELEMETRY_DISABLED WEBSITE_NODE_DEFAULT_VERSION

# 3. Set correct settings
az webapp config appsettings set \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web \
    --settings \
    NODE_ENV="production" \
    NEXT_TELEMETRY_DISABLED="1" \
    WEBSITE_NODE_DEFAULT_VERSION="22.15.0" \
    WEBSITE_RUN_FROM_PACKAGE="1" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"

# 4. Start the app
az webapp start \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web

# 5. Redeploy
./azure-deploy.sh
```

## Monitoring

### Health Check
```bash
# Get the app URL
APP_URL=$(az webapp show \
    --resource-group novizit-frontend-rg \
    --name novizit-frontend-web \
    --query "defaultHostName" \
    --output tsv)

# Test the app
curl -f "https://$APP_URL" || echo "App not responding"
```

### Performance Monitoring
```bash
# Check app metrics
az monitor metrics list \
    --resource-group novizit-frontend-rg \
    --resource-type Microsoft.Web/sites \
    --resource-name novizit-frontend-web \
    --metric "CpuPercentage,MemoryPercentage"
```

## Contact Support

If issues persist:
1. Check Azure status: https://status.azure.com
2. Review Azure App Service documentation
3. Contact Azure support with deployment logs 