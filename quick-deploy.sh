#!/bin/bash

# 🚀 QUICK DEPLOYMENT SCRIPT
# Deploys your app to Firebase in seconds

set -e  # Exit on error

echo "🚀 Quick Deploy to Firebase"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Function to deploy rules only (fastest)
deploy_rules() {
    echo -e "${BLUE}📋 Deploying security rules only...${NC}"
    firebase deploy --only database,firestore:rules --force
    echo -e "${GREEN}✅ Rules deployed!${NC}"
}

# Function to deploy hosting only (fast)
deploy_hosting() {
    echo -e "${BLUE}🏗️  Building for production...${NC}"
    npm run build
    echo -e "${BLUE}🌐 Deploying to hosting...${NC}"
    firebase deploy --only hosting --force
    echo -e "${GREEN}✅ Hosting deployed!${NC}"
}

# Function to deploy everything (complete)
deploy_all() {
    echo -e "${BLUE}🏗️  Building for production...${NC}"
    npm run build
    echo -e "${BLUE}🚀 Deploying everything...${NC}"
    firebase deploy --force
    echo -e "${GREEN}✅ Complete deployment done!${NC}"
}

# Main menu
echo ""
echo "Choose deployment option:"
echo "1) Rules only (fastest - 5 seconds)"
echo "2) Hosting only (fast - ~30 seconds)"
echo "3) Everything (complete - ~45 seconds)"
echo "4) Cancel"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        deploy_rules
        ;;
    2)
        deploy_hosting
        ;;
    3)
        deploy_all
        ;;
    4)
        echo "❌ Cancelled"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📊 View your app:"
echo "   https://oa-ai-dash.web.app"
echo ""
echo "🔧 Firebase Console:"
echo "   https://console.firebase.google.com/project/oa-ai-dash"
echo ""
