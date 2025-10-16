#!/bin/bash

# 🔥 Firebase Security Rules Deployment Script
# This script deploys ONLY the security rules (no hosting/code)

echo "🔥 Firebase Security Rules Deployment"
echo "======================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI installed!"
    echo ""
fi

# Check if user is logged in
echo "📝 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo ""
    echo "⚠️  You need to login to Firebase first!"
    echo ""
    echo "Running: firebase login"
    echo ""
    firebase login
else
    echo "✅ Already logged in!"
fi

echo ""
echo "📋 Available Firebase projects:"
firebase projects:list

echo ""
echo "🎯 Current project: oa-ai-dash"
echo ""

# Ask user to confirm
read -p "Deploy security rules to 'oa-ai-dash'? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Deploying security rules..."
    echo ""
    
    # Deploy only database and firestore rules
    firebase deploy --only database,firestore:rules
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Security rules deployed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Verify rules at: https://console.firebase.google.com/project/oa-ai-dash"
        echo "2. Test your application"
        echo "3. Check that unauthorized access is blocked"
        echo ""
    else
        echo ""
        echo "❌ Deployment failed!"
        echo ""
        echo "Common fixes:"
        echo "1. Make sure project 'oa-ai-dash' exists"
        echo "   - Go to: https://console.firebase.google.com"
        echo "   - Create project if needed"
        echo ""
        echo "2. Enable Realtime Database:"
        echo "   - Firebase Console → Realtime Database → Create Database"
        echo ""
        echo "3. Enable Firestore (if using):"
        echo "   - Firebase Console → Firestore Database → Create Database"
        echo ""
        echo "4. Check permissions:"
        echo "   - Run: firebase logout"
        echo "   - Run: firebase login"
        echo ""
    fi
else
    echo ""
    echo "❌ Deployment cancelled"
    echo ""
fi
