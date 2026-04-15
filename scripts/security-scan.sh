#!/bin/bash

# DevSecOps Local Security Scan Script
# This script runs basic security checks on the local environment.

echo "--------------------------------------------------"
echo "🚀 Starting DevSecOps Security Scans..."
echo "--------------------------------------------------"

# 1. NPM Audit
echo "🔍 Running NPM Audit..."
npm audit --audit-level=high
if [ $? -ne 0 ]; then
    echo "⚠️  High vulnerabilities found in NPM dependencies!"
else
    echo "✅ NPM dependencies are secure."
fi

# 2. Secret Scanning (using grep for common patterns)
echo "🔍 Scanning for hardcoded secrets..."
grep -rE "AIza[0-9A-Za-z-_]{35}|[0-9a-f]{32}|[0-9a-f]{40}" . --exclude-dir={node_modules,dist,.git}
if [ $? -eq 0 ]; then
    echo "⚠️  Potential secrets found in code! Please review."
else
    echo "✅ No obvious hardcoded secrets found."
fi

# 3. Dockerfile Best Practices (Check for root user)
echo "🔍 Checking Dockerfiles for best practices..."
if grep -q "USER" devops/docker/*.Dockerfile; then
    echo "✅ Dockerfiles use non-root USER."
else
    echo "⚠️  Dockerfiles might be running as root! Consider adding a USER instruction."
fi

# 4. Trivy Scan (if installed)
if command -v trivy &> /dev/null; then
    echo "🔍 Running Trivy scan on current directory..."
    trivy fs .
else
    echo "ℹ️  Trivy not installed. Skipping filesystem scan."
fi

echo "--------------------------------------------------"
echo "✅ Security Scan Completed!"
echo "--------------------------------------------------"
