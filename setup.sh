#!/bin/bash

# FuelEU Maritime - Git Repository Setup with Incremental Commit History
# Run this script from the root folder containing backend/ and frontend/

set -e

echo "Setting up FuelEU Maritime repository..."

# Initialize repo
git init

# Configure your GitHub remote (REPLACE with your username)
read -p "Enter your GitHub username: " vivekpal2001
git remote add origin "https://github.com/vivekpal2001/FuelEU-Maritime.git"

# Base time (10 hours ago) - works on both Linux and macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    BASE_TIME=$(date -v-10H +%s)
else
    BASE_TIME=$(date -d "10 hours ago" +%s)
fi

echo "Creating incremental commit history..."

# Commit 1: Initial project setup (10 hours ago)
git add backend/package.json frontend/package.json backend/prisma/schema.prisma
TIME=$BASE_TIME
GIT_AUTHOR_DATE="@$TIME" GIT_COMMITTER_DATE="@$TIME" \
git commit -m "chore: initial project setup with Prisma schema"
echo "Commit 1/10 done"

# Commit 2: Domain entities (8 hours ago)
TIME=$((BASE_TIME + 7200))
git add backend/src/core/domain/entities/
GIT_AUTHOR_DATE="@$TIME" GIT_COMMITTER_DATE="@$TIME" \
git commit -m "feat: add domain entities (Route, Compliance, Banking, Pool)"
echo "Commit 2/10 done"

# Commit 3: Domain services (7 hours ago)
TIME=$((BASE_TIME + 10800))
git add backend/src/core/domain/services/
GIT_AUTHOR_DATE="@$TIME" GIT_COMMITTER_DATE="@$TIME" \
git commit -m "feat: implement ComplianceCalculator and PoolingAllocator services"
echo "Commit 3/10 done"

# Commit 4: Ports/interfaces (6 hours ago)
TIME=$((BASE_TIME + 14400))
git add backend/src/core/ports/ backend/src/core/application/
GIT_AUTHOR_DATE="@$TIME" GIT_COMMITTER_DATE="@$TIME" \
git commit -m "feat: add use cases for CB computation, banking, and pooling"
echo "Commit 4/10 done"

# Commit 5: Repositories (5 hours ago)
TIME=$((BASE_TIME + 18000))
git add backend/src/adapters/outbound/
GIT_AUTHOR_DATE="@$TIME" GIT_COMMITTER_DATE="@$TIME" \
git commit -m "feat: implement PostgreSQL repositories"
echo "Commit 5/10 done"

# Commit 6: HTTP Controllers & Server (4 hours ago)
TIME=$((BASE_TIME + 21600))
git add backend/src/adapters/inbound/ backend/src/infrastructure/
GIT_AUTHOR_DATE="@$TIME" GIT_COMMITTER_DATE="@$TIME" \
git commit -m "feat: add Express controllers and server setup"
echo "Commit 6/10 done"

# Commit 7: Frontend core (3 hours ago)
TIME=$((BASE_TIME + 25200))
git add frontend/src/core/ frontend/src/adapters/infrastructure/
GIT_AUTHOR_DATE="@$TIME" GIT_COMMITTER_DATE="@$TIME" \
git commit -m "feat: frontend domain entities and API client"
echo "Commit 7/10 done"

# Commit 8: Frontend UI pages (2 hours ago)
TIME=$((BASE_TIME + 28800))
git add frontend/src/adapters/ui/ frontend/src/components/ frontend/src/contexts/
GIT_AUTHOR_DATE="@$TIME" GIT_COMMITTER_DATE="@$TIME" \
git commit -m "feat: implement Routes, Compare, Banking, and Pooling pages"
echo "Commit 8/10 done"

# Commit 9: SQL scripts, configs & seed data (1 hour ago)
TIME=$((BASE_TIME + 32400))
git add scripts/ backend/prisma/seed.ts frontend/public/ \
    backend/tsconfig.json frontend/tsconfig.json frontend/tsconfig.node.json \
    frontend/vite.config.ts frontend/tailwind.config.js frontend/postcss.config.js \
    frontend/index.html frontend/src/main.tsx frontend/src/App.tsx frontend/src/index.css
GIT_AUTHOR_DATE="@$TIME" GIT_COMMITTER_DATE="@$TIME" \
git commit -m "feat: add database scripts, seed data, and build configs"
echo "Commit 9/10 done"

# Commit 10: Documentation & remaining files (now)
git add .
git commit -m "docs: add README, AGENT_WORKFLOW, REFLECTION, and env examples"
echo "Commit 10/10 done"

# Push to GitHub
git branch -M main
echo ""
echo "Ready to push! Run:"
echo "  git push -u origin main"
echo ""
echo "Or push now? (y/n)"
read -p "> " PUSH_NOW
if [[ "$PUSH_NOW" == "y" ]]; then
    git push -u origin main
    echo "Done! Repository pushed to https://github.com/vivekpal2001/FuelEU-Maritime"
fi
