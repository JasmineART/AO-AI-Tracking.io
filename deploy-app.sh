#!/bin/bash

# ⚡ HOSTING ONLY - Fast deployment (~30 seconds)
# Use this when you changed code but not security rules

echo "🏗️  Building..."
npm run build

echo "🚀 Deploying..."
firebase deploy --only hosting --force

echo ""
echo "✅ App deployed!"
echo "🌐 Live at: https://oa-ai-dash.web.app"
