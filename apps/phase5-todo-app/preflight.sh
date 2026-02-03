#!/bin/bash
# ============================================
# Pre-flight Checks Script
# Validates environment before deployment
# ============================================

echo "🔧 Running pre-flight checks..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any checks fail
FAILED=0

# Function to print status
print_check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        FAILED=1
    fi
}

# Check Docker Desktop
echo "1. Checking Docker Desktop..."
if docker info > /dev/null 2>&1; then
    print_check 0 "Docker Desktop is running"
else
    print_check 1 "Docker Desktop is NOT running"
    echo -e "${YELLOW}   → Start Docker Desktop and wait for it to initialize${NC}"
fi
echo ""

# Check Docker Compose
echo "2. Checking Docker Compose..."
if docker-compose --version > /dev/null 2>&1; then
    VERSION=$(docker-compose --version)
    print_check 0 "Docker Compose installed: $VERSION"
else
    print_check 1 "Docker Compose not found"
fi
echo ""

# Check if ports are available
echo "3. Checking port availability..."

# Check port 3002
if netstat -ano 2>/dev/null | grep -q ":3002.*LISTENING" || lsof -i :3002 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3002 is already in use${NC}"
    if command -v netstat &> /dev/null; then
        netstat -ano | grep ":3002.*LISTENING" | head -1
    fi
    echo "   You may need to stop the existing service or change the port"
else
    print_check 0 "Port 3002 is available"
fi

# Check port 8000
if netstat -ano 2>/dev/null | grep -q ":8000.*LISTENING" || lsof -i :8000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use${NC}"
    if command -v netstat &> /dev/null; then
        netstat -ano | grep ":8000.*LISTENING" | head -1
    fi
    echo "   You may need to stop the existing service or change the port"
else
    print_check 0 "Port 8000 is available"
fi
echo ""

# Check environment files
echo "4. Checking environment configuration..."

if [ -f "backend/.env" ]; then
    print_check 0 "backend/.env exists"

    # Check required variables
    if grep -q "BETTER_AUTH_SECRET" backend/.env; then
        print_check 0 "BETTER_AUTH_SECRET configured in backend/.env"
    else
        print_check 1 "BETTER_AUTH_SECRET missing in backend/.env"
    fi

    if grep -q "DATABASE_URL" backend/.env; then
        print_check 0 "DATABASE_URL configured in backend/.env"
    else
        print_check 1 "DATABASE_URL missing in backend/.env"
    fi
else
    print_check 1 "backend/.env missing"
    echo -e "${YELLOW}   → Copy backend/.env.example to backend/.env${NC}"
fi
echo ""

if [ -f "frontend/.env.local" ]; then
    print_check 0 "frontend/.env.local exists"

    # Check required variables
    if grep -q "BETTER_AUTH_SECRET" frontend/.env.local; then
        print_check 0 "BETTER_AUTH_SECRET configured in frontend/.env.local"
    else
        print_check 1 "BETTER_AUTH_SECRET missing in frontend/.env.local"
    fi
else
    echo -e "${YELLOW}⚠️  frontend/.env.local missing (optional for Docker)${NC}"
    echo "   Environment variables will be provided by docker-compose.yml"
fi
echo ""

# Check Dockerfile existence
echo "5. Checking Docker configuration files..."

if [ -f "backend/Dockerfile" ]; then
    print_check 0 "backend/Dockerfile exists"
else
    print_check 1 "backend/Dockerfile missing"
fi

if [ -f "frontend/Dockerfile" ]; then
    print_check 0 "frontend/Dockerfile exists"
else
    print_check 1 "frontend/Dockerfile missing"
fi

if [ -f "docker-compose.yml" ]; then
    print_check 0 "docker-compose.yml exists"
else
    print_check 1 "docker-compose.yml missing"
fi
echo ""

# Check disk space
echo "6. Checking disk space..."
if command -v df &> /dev/null; then
    AVAILABLE=$(df -h . | tail -1 | awk '{print $4}')
    echo -e "${GREEN}✅ Available disk space: $AVAILABLE${NC}"
else
    echo -e "${YELLOW}⚠️  Cannot check disk space${NC}"
fi
echo ""

# Summary
echo "======================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All pre-flight checks passed!${NC}"
    echo "======================================"
    echo ""
    echo "You can now run:"
    echo "  docker-compose up --build"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some pre-flight checks failed${NC}"
    echo "======================================"
    echo ""
    echo "Please fix the issues above before deploying."
    echo ""
    exit 1
fi
