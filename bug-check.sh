#!/bin/bash

# Comprehensive System Bug Check Script
# Runs various checks to ensure site reliability

echo "🔍 Starting Comprehensive System Bug Check..."
echo "=============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print colored output
print_status() {
    if [ "$1" == "OK" ]; then
        echo -e "${GREEN}✓${NC} $2"
    elif [ "$1" == "WARNING" ]; then
        echo -e "${YELLOW}⚠${NC} $2"
        ((WARNINGS++))
    elif [ "$1" == "ERROR" ]; then
        echo -e "${RED}✗${NC} $2"
        ((ERRORS++))
    else
        echo -e "${BLUE}ℹ${NC} $2"
    fi
}

# 1. Check Node.js and npm
echo "📦 Checking Dependencies..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_status "OK" "Node.js installed: $NODE_VERSION"
else
    print_status "ERROR" "Node.js not found"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_status "OK" "npm installed: $NPM_VERSION"
else
    print_status "ERROR" "npm not found"
fi

echo ""

# 2. Check package.json exists
echo "📄 Checking Project Files..."
if [ -f "package.json" ]; then
    print_status "OK" "package.json found"
else
    print_status "ERROR" "package.json not found"
fi

if [ -f "firebase.json" ]; then
    print_status "OK" "firebase.json found"
else
    print_status "WARNING" "firebase.json not found"
fi

if [ -f "webpack.config.js" ]; then
    print_status "OK" "webpack.config.js found"
else
    print_status "WARNING" "webpack.config.js not found"
fi

echo ""

# 3. Check node_modules
echo "📚 Checking Dependencies Installation..."
if [ -d "node_modules" ]; then
    print_status "OK" "node_modules directory exists"
    MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    print_status "INFO" "Found $MODULE_COUNT installed packages"
else
    print_status "ERROR" "node_modules not found - run 'npm install'"
fi

echo ""

# 4. Check critical source files
echo "🔍 Checking Source Files..."
REQUIRED_FILES=(
    "src/App.js"
    "src/firebase.js"
    "src/index.css"
    "src/contexts/AuthContext.js"
    "src/pages/Dashboard.js"
    "src/pages/Home.js"
    "src/pages/Login.js"
    "src/pages/Projects.js"
    "src/utils/realtimeDatabase.js"
    "src/utils/errorMonitoring.js"
    "src/utils/healthCheck.js"
    "src/utils/validators.js"
    "src/components/ErrorBoundary.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "OK" "$file exists"
    else
        print_status "ERROR" "$file missing"
    fi
done

echo ""

# 5. Check for JavaScript/JSX syntax errors
echo "🔧 Checking for Syntax Errors..."
if command -v npx &> /dev/null; then
    # Check if eslint is available
    if [ -d "node_modules/eslint" ]; then
        echo "Running ESLint..."
        npx eslint src --ext .js,.jsx --format compact > /tmp/eslint-report.txt 2>&1
        ESLINT_EXIT=$?
        
        if [ $ESLINT_EXIT -eq 0 ]; then
            print_status "OK" "No linting errors found"
        else
            ERROR_COUNT=$(grep -c "Error" /tmp/eslint-report.txt || echo "0")
            WARNING_COUNT=$(grep -c "Warning" /tmp/eslint-report.txt || echo "0")
            
            if [ "$ERROR_COUNT" != "0" ]; then
                print_status "ERROR" "Found $ERROR_COUNT linting errors"
            fi
            if [ "$WARNING_COUNT" != "0" ]; then
                print_status "WARNING" "Found $WARNING_COUNT linting warnings"
            fi
        fi
    else
        print_status "INFO" "ESLint not installed - skipping lint check"
    fi
else
    print_status "WARNING" "npx not available - skipping syntax check"
fi

echo ""

# 6. Check build directory
echo "🏗️  Checking Build Status..."
if [ -d "dist" ] || [ -d "build" ]; then
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
        print_status "OK" "dist/ directory exists (${BUILD_SIZE})"
    fi
    if [ -d "build" ]; then
        BUILD_SIZE=$(du -sh build 2>/dev/null | cut -f1)
        print_status "OK" "build/ directory exists (${BUILD_SIZE})"
    fi
else
    print_status "WARNING" "No build directory found - run 'npm run build'"
fi

echo ""

# 7. Check Firebase configuration
echo "🔥 Checking Firebase Setup..."
if [ -f "src/firebase.js" ]; then
    if grep -q "apiKey" src/firebase.js; then
        print_status "OK" "Firebase config found"
    else
        print_status "ERROR" "Firebase config incomplete"
    fi
else
    print_status "ERROR" "firebase.js not found"
fi

if [ -f "database.rules.json" ]; then
    print_status "OK" "Database rules found"
else
    print_status "WARNING" "database.rules.json not found"
fi

echo ""

# 8. Check for common issues
echo "🐛 Checking for Common Issues..."

# Check for console.log statements (should be removed in production)
CONSOLE_LOGS=$(grep -r "console\.log" src --include="*.js" --include="*.jsx" | wc -l)
if [ "$CONSOLE_LOGS" -gt 20 ]; then
    print_status "WARNING" "Found $CONSOLE_LOGS console.log statements - consider removing for production"
else
    print_status "OK" "Console.log usage acceptable ($CONSOLE_LOGS found)"
fi

# Check for TODO comments
TODO_COUNT=$(grep -r "TODO" src --include="*.js" --include="*.jsx" | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
    print_status "INFO" "Found $TODO_COUNT TODO comments"
fi

# Check for FIXME comments
FIXME_COUNT=$(grep -r "FIXME" src --include="*.js" --include="*.jsx" | wc -l)
if [ "$FIXME_COUNT" -gt 0 ]; then
    print_status "WARNING" "Found $FIXME_COUNT FIXME comments"
fi

echo ""

# 9. Check Git status
echo "📊 Checking Git Status..."
if [ -d ".git" ]; then
    print_status "OK" "Git repository initialized"
    
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ "$UNCOMMITTED" -eq 0 ]; then
        print_status "OK" "Working directory clean"
    else
        print_status "INFO" "$UNCOMMITTED uncommitted changes"
    fi
    
    CURRENT_BRANCH=$(git branch --show-current)
    print_status "INFO" "Current branch: $CURRENT_BRANCH"
else
    print_status "WARNING" "Not a git repository"
fi

echo ""

# 10. Check port availability
echo "🌐 Checking Port Availability..."
if command -v lsof &> /dev/null; then
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status "INFO" "Port 3000 is in use (dev server may be running)"
    else
        print_status "OK" "Port 3000 is available"
    fi
else
    print_status "INFO" "lsof not available - skipping port check"
fi

echo ""
echo "=============================================="
echo "📋 Bug Check Summary"
echo "=============================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! System is healthy.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warnings found. Review recommended.${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS errors and $WARNINGS warnings found!${NC}"
    echo -e "${RED}Please fix errors before deploying.${NC}"
    exit 1
fi
