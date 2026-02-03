#!/bin/bash
# ============================================
# Deployment Verification Script
# Validates that both services are healthy
# ============================================

set -e

echo "🔍 Verifying deployment..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check if Docker is running
echo "Checking Docker status..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker Desktop and wait for it to initialize."
    exit 1
fi
print_status 0 "Docker is running"
echo ""

# Check if containers are running
echo "Checking container status..."
BACKEND_RUNNING=$(docker-compose ps -q backend)
FRONTEND_RUNNING=$(docker-compose ps -q frontend)

if [ -z "$BACKEND_RUNNING" ]; then
    echo -e "${RED}❌ Backend container is not running${NC}"
    exit 1
fi
print_status 0 "Backend container is running"

if [ -z "$FRONTEND_RUNNING" ]; then
    echo -e "${RED}❌ Frontend container is not running${NC}"
    exit 1
fi
print_status 0 "Frontend container is running"
echo ""

# Wait a moment for services to fully start
echo "Waiting for services to initialize..."
sleep 5
echo ""

# Check backend health
echo "Checking backend health endpoint..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_status 0 "Backend responding on port 8000"
    BACKEND_RESPONSE=$(curl -s http://localhost:8000/health)
    echo "Backend response: $BACKEND_RESPONSE"
else
    print_status 1 "Backend not responding on port 8000"
    echo ""
    echo -e "${YELLOW}Backend logs:${NC}"
    docker-compose logs backend --tail 50
    exit 1
fi
echo ""

# Check frontend health
echo "Checking frontend health endpoint..."
if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
    print_status 0 "Frontend responding on port 3002"
    FRONTEND_RESPONSE=$(curl -s http://localhost:3002/api/health)
    echo "Frontend response: $FRONTEND_RESPONSE"
else
    print_status 1 "Frontend not responding on port 3002"
    echo ""
    echo -e "${YELLOW}Frontend logs:${NC}"
    docker-compose logs frontend --tail 50
    exit 1
fi
echo ""

# Check if frontend homepage loads
echo "Checking frontend homepage..."
if curl -f http://localhost:3002 > /dev/null 2>&1; then
    print_status 0 "Frontend homepage accessible"
else
    print_status 1 "Frontend homepage not accessible"
    exit 1
fi
echo ""

# Check backend API docs
echo "Checking backend API documentation..."
if curl -f http://localhost:8000/docs > /dev/null 2>&1; then
    print_status 0 "Backend API docs accessible"
else
    print_status 1 "Backend API docs not accessible"
fi
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}✅ All services are healthy!${NC}"
echo "======================================"
echo ""
echo "📝 Access points:"
echo "   Frontend: http://localhost:3002"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🧪 You can now test the application:"
echo "   1. Open http://localhost:3002 in your browser"
echo "   2. Register a new account"
echo "   3. Create todos"
echo ""
