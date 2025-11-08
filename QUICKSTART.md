# 🚀 OSINT Lab Pro - Quick Start Guide

## Install & Run in 30 Seconds

```bash
# 1. Clone and navigate
git clone https://github.com/alzaem2002-ctrl/Osint-lab-pro.git
cd Osint-lab-pro

# 2. Deploy
chmod +x deploy-osint-lab-pro.sh
./deploy-osint-lab-pro.sh
```

That's it! The app will open at http://localhost:8501

## Alternative: Manual Setup

```bash
# Create environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run app
streamlit run streamlit_app_v2.py
```

## Choose Your Version

- **streamlit_app_v2.py** - Full-featured (recommended)
- **streamlit_app_fixed.py** - Simplified version

## Quick Commands

```bash
# Start the app
./deploy-osint-lab-pro.sh

# Or use quick start script (after first deployment)
./start_osint_lab.sh

# Change port
PORT=8080 ./deploy-osint-lab-pro.sh

# Stop the app
Ctrl+C
```

## First Time Setup Only

The deployment script will automatically:
1. ✅ Check system requirements
2. ✅ Create virtual environment
3. ✅ Install all dependencies
4. ✅ Configure Streamlit
5. ✅ Start the application

## Access the App

- **Local**: http://localhost:8501
- **Network**: http://YOUR_IP:8501
- **PWA**: Open index.html in browser

## Tools Available

1. 🌐 **Domain Analyzer** - WHOIS, DNS, IP info
2. 🌍 **IP Lookup** - Geolocation, ISP details
3. 📧 **Email Validator** - Format check, MX records
4. 👥 **Social Media Finder** - Profile search
5. 📱 **Phone Lookup** - Number analysis
6. 🔎 **Username Search** - Availability check
7. 🔒 **Breach Checker** - Security verification
8. 📄 **Metadata Extractor** - File analysis

## Need Help?

- **Full Guide**: See `ULTIMATE_DEPLOYMENT_PROMPT.md`
- **Issues**: Check troubleshooting section
- **Support**: Open GitHub issue

## Legal Notice

⚠️ **For legal and ethical use only**. Always:
- Get proper authorization
- Respect privacy laws
- Follow ethical guidelines
- Don't use for malicious purposes

---

**Ready to start? Run the deployment script! 🎉**
