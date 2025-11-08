# Osint-lab-pro
Osint lab pro hybrid pwa

> For contributor and Copilot-coding-agent onboarding, see: `.github/COPILOT-CODING-AGENT.md`

## 🚀 Deployment

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Git

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alzaem2002-ctrl/Osint-lab-pro.git
   cd Osint-lab-pro
   ```

2. **Run the deployment script:**
   ```bash
   chmod +x deploy-osint-lab-pro.sh
   ./deploy-osint-lab-pro.sh [environment]
   ```
   
   Available environments:
   - `production` (default)
   - `staging`
   - `development`

3. **Start the application:**
   ```bash
   npm start
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

### Deployment Script Features

The `deploy-osint-lab-pro.sh` script automates the entire deployment process:

- ✅ Checks system dependencies (Node.js, npm, git)
- ✅ Creates project structure
- ✅ Initializes package.json for PWA
- ✅ Creates Progressive Web App files (manifest, service worker)
- ✅ Sets up a simple Node.js server
- ✅ Installs dependencies
- ✅ Configures environment-specific settings
- ✅ Generates deployment logs

### Manual Deployment

If you prefer to deploy manually:

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Or for production
NODE_ENV=production npm start
```

## 📱 Progressive Web App Features

This application is built as a hybrid PWA with:
- Offline functionality via Service Worker
- Installable on mobile and desktop devices
- Fast loading with caching strategies
- Responsive design
- Arabic language support

## 🔧 Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📝 License

ISC
