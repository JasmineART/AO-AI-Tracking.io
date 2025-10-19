#!/bin/bash

# ⚡ RULES ONLY - Super fast deployment (5 seconds)
# Use this when you only changed database.rules.json or firestore.rules

firebase deploy --only database,firestore:rules --force

echo ""
echo "✅ Security rules deployed!"
echo "🔗 Console: https://console.firebase.google.com/project/oa-ai-dash/database/rules"
