# Azure Frontend Deployment Guide

This guide provides step-by-step instructions for deploying the Real Estate Platform frontend to Azure App Service.

## Prerequisites

- Azure CLI installed and configured
- Node.js 18+ installed locally
- Git repository with frontend code
- Azure subscription with appropriate permissions

## Quick Deployment

### Option 1: Using Azure CLI Script (Recommended)

```bash
# Make the script executable
chmod +x azure-deploy.sh

# Run the deployment script
./azure-deploy.sh
```

### Option 2: Using PowerShell Script

```powershell
# Run the PowerShell deployment script
.\azure-deploy.ps1
```

### Option 3: Manual Deployment

Follow the steps below for manual deployment.

## Manual Deployment Steps

### 1. Azure CLI Setup

```bash
# Install Azure CLI (if not already installed)
# Windows: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows
# macOS: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "Your-Subscription-Name"
```

### 2. Create Azure Resources

```bash
# Create resource group
az group create --name "Data_base" --location "East US"

# Create App Service plan
az appservice plan create \
    --name "real-estate-frontend-plan" \
    --resource-group "Data_base" \
    --sku "B1" \
    --is-linux

# Create App Service
az webapp create \
    --name "real-estate-frontend" \
    --resource-group "Data_base" \
    --plan "real-estate-frontend-plan" \
    --runtime "NODE|18-lts" \
    --deployment-local-git
```

### 3. Configure App Service

```bash
# Set Node.js version
az webapp config set \
    --resource-group "Data_base" \
    --name "real-estate-frontend" \
    --linux-fx-version "NODE|18-lts"

# Set startup command
az webapp config set \
    --resource-group "Data_base" \
    --name "real-estate-frontend" \
    --startup-file "npm start"

# Enable logging
az webapp log config \
    --resource-group "Data_base" \
    --name "real-estate-frontend" \
    --web-server-logging filesystem
```

### 4. Build and Deploy

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Create deployment package
zip -r deployment.zip . -x "node_modules/*" ".git/*" "*.log" "coverage/*" ".env*" "src/*" ".next/*"

# Deploy to Azure
az webapp deployment source config-zip \
    --resource-group "Data_base" \
    --name "real-estate-frontend" \
    --src deployment.zip

# Clean up
rm deployment.zip
```

### 5. Configure Environment Variables

```bash
# Set environment variables
az webapp config appsettings set \
    --resource-group "Data_base" \
    --name "real-estate-frontend" \
    --settings \
        NODE_ENV="production" \
        NEXT_TELEMETRY_DISABLED="1" \
        NEXT_PUBLIC_API_URL="https://your-backend-app.azurewebsites.net/api"
```

## CI/CD Pipeline Deployment

### Using Azure DevOps

1. Create a new pipeline in Azure DevOps
2. Use the `azure-pipelines.yml` file as the pipeline definition
3. Configure the Azure subscription connection
4. Set up branch policies for automatic deployment

### Pipeline Features

- **Build Stage**: Installs dependencies, builds the application, runs linting
- **Deploy Stage**: Deploys to Azure App Service with proper configuration
- **Health Checks**: Verifies deployment success
- **Environment Variables**: Automatically configures production settings

## Configuration Files

### next.config.js
- Optimized for production deployment
- Security headers configuration
- Image optimization settings

### Dockerfile
- Multi-stage build for optimized image size
- Security best practices (non-root user)
- Health check configuration

### startup.sh
- Handles Azure App Service startup
- Installs production dependencies
- Starts the Next.js application

## Environment Variables

### Required Variables

```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_API_URL=https://your-backend-app.azurewebsites.net/api
```

### Optional Variables

```bash
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
NEXT_PUBLIC_APP_NAME=Real Estate Platform
```

## Monitoring and Logging

### Enable Application Logs

```bash
# Enable application logging
az webapp log config \
    --resource-group "Data_base" \
    --name "real-estate-frontend" \
    --application-logging filesystem

# View logs
az webapp log tail \
    --resource-group "Data_base" \
    --name "real-estate-frontend"
```

### Health Checks

The application includes health check endpoints:
- `GET /` - Main application health
- `GET /api/health` - API health check

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

2. **Deployment Failures**
   - Verify Azure CLI is logged in
   - Check resource group and app service names
   - Ensure proper permissions

3. **Runtime Errors**
   - Check application logs
   - Verify environment variables
   - Test locally with production build

### Debug Commands

```bash
# Check app service status
az webapp show --resource-group "Data_base" --name "real-estate-frontend"

# View recent deployments
az webapp deployment list --resource-group "Data_base" --name "real-estate-frontend"

# SSH into app service (for debugging)
az webapp ssh --resource-group "Data_base" --name "real-estate-frontend"
```

## Security Best Practices

1. **Environment Variables**: Never commit sensitive data to source control
2. **HTTPS**: Always use HTTPS in production
3. **Security Headers**: Configured in next.config.js
4. **Non-root User**: Dockerfile runs as non-root user
5. **Dependency Scanning**: Regularly update dependencies

## Performance Optimization

1. **Image Optimization**: Configured in next.config.js
2. **Bundle Analysis**: Use `npm run analyze` for bundle analysis
3. **CDN**: Consider Azure CDN for static assets
4. **Caching**: Configure appropriate cache headers

## Next Steps

1. Set up custom domain and SSL certificate
2. Configure Azure CDN for better performance
3. Set up monitoring with Azure Application Insights
4. Configure backup and disaster recovery
5. Set up staging environment for testing

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Azure App Service logs
3. Consult Azure documentation
4. Contact the development team

---

**Note**: This deployment setup follows the same patterns as the backend deployment for consistency and maintainability. 