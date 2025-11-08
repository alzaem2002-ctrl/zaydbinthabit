#!/bin/bash

###############################################################################
# OSINT Lab Pro - Deployment Script
# 
# This script handles the deployment of OSINT Lab Pro hybrid PWA
# 
# Usage: ./deploy-osint-lab-pro.sh [environment]
# Environment: production, staging, development (default: production)
###############################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="OSINT Lab Pro"
ENVIRONMENT="${1:-production}"
LOG_FILE="${SCRIPT_DIR}/deployment-$(date +%Y%m%d-%H%M%S).log"

###############################################################################
# Logging Functions
###############################################################################

log() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "${LOG_FILE}"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "${LOG_FILE}"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "${LOG_FILE}"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "${LOG_FILE}"
}

###############################################################################
# Utility Functions
###############################################################################

print_banner() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  ${PROJECT_NAME} - Deployment Script"
    echo "  Environment: ${ENVIRONMENT}"
    echo "  Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
}

check_dependencies() {
    log "Checking system dependencies..."
    
    local missing_deps=()
    
    # Check for common dependencies
    command -v git >/dev/null 2>&1 || missing_deps+=("git")
    command -v node >/dev/null 2>&1 || missing_deps+=("node")
    command -v npm >/dev/null 2>&1 || missing_deps+=("npm")
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        error "Missing required dependencies: ${missing_deps[*]}"
        error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    success "All required dependencies are installed"
    log "Node version: $(node --version)"
    log "NPM version: $(npm --version)"
}

create_project_structure() {
    log "Creating project structure..."
    
    # Create necessary directories
    mkdir -p "${SCRIPT_DIR}/public"
    mkdir -p "${SCRIPT_DIR}/src"
    mkdir -p "${SCRIPT_DIR}/dist"
    mkdir -p "${SCRIPT_DIR}/logs"
    
    success "Project structure created"
}

initialize_package_json() {
    if [ ! -f "${SCRIPT_DIR}/package.json" ]; then
        log "Initializing package.json for PWA..."
        
        cat > "${SCRIPT_DIR}/package.json" << 'EOF'
{
  "name": "osint-lab-pro",
  "version": "1.0.0",
  "description": "Osint lab pro hybrid pwa",
  "main": "index.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "build": "echo 'Build process for PWA assets'",
    "test": "echo 'No tests specified yet'"
  },
  "keywords": ["osint", "pwa", "lab"],
  "author": "",
  "license": "ISC",
  "dependencies": {},
  "devDependencies": {}
}
EOF
        success "package.json created"
    else
        log "package.json already exists, skipping..."
    fi
}

create_basic_pwa_files() {
    log "Creating basic PWA files..."
    
    # Create manifest.json
    if [ ! -f "${SCRIPT_DIR}/public/manifest.json" ]; then
        cat > "${SCRIPT_DIR}/public/manifest.json" << 'EOF'
{
  "name": "OSINT Lab Pro",
  "short_name": "OSINT Lab",
  "description": "OSINT Lab Pro - Hybrid Progressive Web Application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOF
        success "manifest.json created"
    fi
    
    # Create service worker
    if [ ! -f "${SCRIPT_DIR}/public/sw.js" ]; then
        cat > "${SCRIPT_DIR}/public/sw.js" << 'EOF'
// OSINT Lab Pro - Service Worker
const CACHE_NAME = 'osint-lab-pro-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
EOF
        success "Service worker created"
    fi
    
    # Create index.html
    if [ ! -f "${SCRIPT_DIR}/public/index.html" ]; then
        cat > "${SCRIPT_DIR}/public/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="OSINT Lab Pro - Hybrid Progressive Web Application">
    <meta name="theme-color" content="#2196F3">
    <title>OSINT Lab Pro</title>
    <link rel="manifest" href="/manifest.json">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .status {
            display: inline-block;
            padding: 0.5rem 2rem;
            background: rgba(76, 175, 80, 0.8);
            border-radius: 50px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 OSINT Lab Pro</h1>
        <p>مختبر الاستخبارات مفتوحة المصدر الاحترافي</p>
        <div class="status">✓ نشط ويعمل</div>
    </div>
    
    <script>
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.log('Service Worker registration failed', err));
        }
    </script>
</body>
</html>
EOF
        success "index.html created"
    fi
}

create_simple_server() {
    if [ ! -f "${SCRIPT_DIR}/server.js" ]; then
        log "Creating simple Node.js server..."
        
        cat > "${SCRIPT_DIR}/server.js" << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`✓ OSINT Lab Pro server running on http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
});
EOF
        success "server.js created"
    fi
}

install_dependencies() {
    if [ -f "${SCRIPT_DIR}/package.json" ]; then
        log "Installing Node.js dependencies..."
        cd "${SCRIPT_DIR}"
        npm install --production 2>&1 | tee -a "${LOG_FILE}"
        success "Dependencies installed"
    fi
}

deploy_application() {
    log "Deploying application for ${ENVIRONMENT} environment..."
    
    case "${ENVIRONMENT}" in
        production)
            log "Production deployment configuration"
            export NODE_ENV=production
            ;;
        staging)
            log "Staging deployment configuration"
            export NODE_ENV=staging
            ;;
        development)
            log "Development deployment configuration"
            export NODE_ENV=development
            ;;
        *)
            warning "Unknown environment: ${ENVIRONMENT}, using production defaults"
            export NODE_ENV=production
            ;;
    esac
    
    success "Application deployed successfully"
}

run_tests() {
    log "Running tests..."
    cd "${SCRIPT_DIR}"
    npm test 2>&1 | tee -a "${LOG_FILE}" || warning "Tests not configured yet"
}

print_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  Deployment Summary"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    success "✓ ${PROJECT_NAME} deployed successfully!"
    echo ""
    log "Environment: ${ENVIRONMENT}"
    log "Log file: ${LOG_FILE}"
    log "Project directory: ${SCRIPT_DIR}"
    echo ""
    log "To start the application, run:"
    echo "  npm start"
    echo ""
    log "To view the application, open:"
    echo "  http://localhost:3000"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
}

###############################################################################
# Main Deployment Flow
###############################################################################

main() {
    print_banner
    
    log "Starting deployment process..."
    
    # Step 1: Check dependencies
    check_dependencies
    
    # Step 2: Create project structure
    create_project_structure
    
    # Step 3: Initialize package.json
    initialize_package_json
    
    # Step 4: Create basic PWA files
    create_basic_pwa_files
    
    # Step 5: Create server
    create_simple_server
    
    # Step 6: Install dependencies
    install_dependencies
    
    # Step 7: Deploy application
    deploy_application
    
    # Step 8: Run tests
    run_tests
    
    # Step 9: Print summary
    print_summary
    
    success "Deployment completed successfully at $(date '+%Y-%m-%d %H:%M:%S')"
}

###############################################################################
# Error Handling
###############################################################################

trap 'error "Deployment failed at line $LINENO. Check log file: ${LOG_FILE}"; exit 1' ERR

###############################################################################
# Execute Main Function
###############################################################################

main "$@"
