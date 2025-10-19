#!/bin/bash

# 📊 QUICK STATUS CHECK
# Shows deployment status and what's changed

echo "📊 Deployment Status Check"
echo "=================================="
echo ""

# Check Firebase status
echo "🔥 Firebase Status:"
if command -v firebase &> /dev/null; then
    echo "  ✅ Firebase CLI: $(firebase --version)"
    echo "  📦 Project: $(firebase use 2>/dev/null || echo 'Not set')"
else
    echo "  ❌ Firebase CLI not installed"
fi

echo ""

# Check Git status
echo "📝 Git Status:"
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current)
    echo "  🌿 Branch: $BRANCH"
    
    CHANGES=$(git status --porcelain | wc -l)
    if [ "$CHANGES" -eq 0 ]; then
        echo "  ✅ No uncommitted changes"
    else
        echo "  📝 $CHANGES file(s) changed:"
        git status --short | head -5
        if [ "$CHANGES" -gt 5 ]; then
            echo "     ... and $((CHANGES - 5)) more"
        fi
    fi
else
    echo "  ❌ Not a git repository"
fi

echo ""

# Check build status
echo "🏗️  Build Status:"
if [ -d "dist" ]; then
    FILES=$(find dist -type f | wc -l)
    SIZE=$(du -sh dist | cut -f1)
    echo "  ✅ Build exists: $FILES files ($SIZE)"
    LAST_BUILD=$(stat -c %y dist 2>/dev/null || stat -f "%Sm" dist 2>/dev/null || echo "unknown")
    echo "  📅 Last build: $LAST_BUILD"
else
    echo "  ❌ No build found (run: npm run build)"
fi

echo ""

# Check if dev server is running
echo "🔧 Dev Server:"
if lsof -i :3000 >/dev/null 2>&1; then
    echo "  ✅ Running on port 3000"
else
    echo "  ⭕ Not running (run: npm start)"
fi

echo ""

# Quick action suggestions
echo "💡 Quick Actions:"
if [ ! -d "dist" ]; then
    echo "  → npm run build          # Build first"
fi
if [ "$CHANGES" -gt 0 ]; then
    echo "  → git add . && git commit -m 'Update'  # Commit changes"
fi
echo "  → ./deploy-rules.sh      # Deploy rules only (5s)"
echo "  → ./deploy-app.sh        # Deploy app (30s)"
echo "  → ./quick-deploy.sh      # Interactive menu"

echo ""
