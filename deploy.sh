#!/bin/bash

# RAGAR Frontend Deployment Script
# Deploys to ai-gamer.pro server

set -e  # Exit on any error

# Configuration
SERVER_HOST="ai-gamer.pro"
SERVER_USER="root"  # Change if different
SSH_KEY="~/.ssh/id_fnm"
REMOTE_DIR="/var/www/ragar-frontend"
BUILD_DIR="dist"

echo "🚀 RAGAR Frontend Deployment Starting..."
echo "📡 Target: $SERVER_HOST"
echo "📂 Remote Directory: $REMOTE_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run commands on remote server
run_remote() {
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "$1"
}

# Function to copy files to remote server
copy_to_remote() {
    scp -i "$SSH_KEY" -r "$1" "$SERVER_USER@$SERVER_HOST:$2"
}

echo -e "${YELLOW}🔍 Checking server connection...${NC}"
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo 'Connection successful'"; then
    echo -e "${RED}❌ Cannot connect to server. Check SSH key and server status.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server connection established${NC}"

# Build the frontend
echo -e "${YELLOW}🏗️  Building frontend application...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Are you in the client directory?${NC}"
    exit 1
fi

# Install dependencies and build
npm install
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed. No $BUILD_DIR directory found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build completed${NC}"

# Create remote directory if it doesn't exist
echo -e "${YELLOW}📁 Preparing remote directory...${NC}"
run_remote "mkdir -p $REMOTE_DIR"

# Backup current deployment (if exists)
echo -e "${YELLOW}💾 Creating backup...${NC}"
run_remote "if [ -d $REMOTE_DIR/dist ]; then cp -r $REMOTE_DIR $REMOTE_DIR.backup.$(date +%Y%m%d_%H%M%S); fi"

# Copy built files to server
echo -e "${YELLOW}📤 Uploading built files...${NC}"
copy_to_remote "$BUILD_DIR/" "$REMOTE_DIR/"

# Copy additional files if needed
if [ -f ".htaccess" ]; then
    copy_to_remote ".htaccess" "$REMOTE_DIR/"
fi

# Set proper permissions
echo -e "${YELLOW}🔐 Setting file permissions...${NC}"
run_remote "chown -R www-data:www-data $REMOTE_DIR"
run_remote "find $REMOTE_DIR -type f -exec chmod 644 {} \;"
run_remote "find $REMOTE_DIR -type d -exec chmod 755 {} \;"

# Configure Nginx (if needed)
echo -e "${YELLOW}⚙️  Configuring web server...${NC}"
run_remote "cat > /etc/nginx/sites-available/ragar-frontend << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ai-gamer.pro www.ai-gamer.pro;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ai-gamer.pro www.ai-gamer.pro;

    # SSL configuration (certificates should already be configured)
    ssl_certificate /etc/letsencrypt/live/ai-gamer.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai-gamer.pro/privkey.pem;

    root $REMOTE_DIR;
    index index.html;

    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle React Router (SPA routing)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    # API proxy to backend
    location /graphql {
        proxy_pass https://api.ai-gamer.pro;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass https://api.ai-gamer.pro;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF"

# Enable the site
run_remote "ln -sf /etc/nginx/sites-available/ragar-frontend /etc/nginx/sites-enabled/"

# Test Nginx configuration
echo -e "${YELLOW}🧪 Testing Nginx configuration...${NC}"
run_remote "nginx -t"

# Reload Nginx
echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
run_remote "systemctl reload nginx"

# Check if site is accessible
echo -e "${YELLOW}🏥 Health check...${NC}"
sleep 2

if curl -s -o /dev/null -w "%{http_code}" "https://$SERVER_HOST" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ RAGAR Frontend deployed successfully!${NC}"
    echo -e "${GREEN}🌐 Website is live at: https://$SERVER_HOST${NC}"
else
    echo -e "${YELLOW}⚠️  Website deployed but health check inconclusive${NC}"
    echo -e "${YELLOW}🔍 Check https://$SERVER_HOST manually${NC}"
fi

echo -e "${GREEN}🎉 RAGAR Frontend deployment completed!${NC}" 