# White-Label College Honesty Shop 🏫

A modern, white-labeled honesty shop management system that can be easily customized for any educational institution. Built with enterprise-grade security, performance optimization, and ISO compliance.

## 🌟 Features

- **Single Source of Truth**: All branding, configuration, and messages are managed in one file: `whitelabel.json`.
- **Easy Customization**: Update your logo, colors, text, and system settings in `whitelabel.json` and the `public/` folder.
- **Safe Upgrades**: When you pull updates from the main repo, your custom `whitelabel.json` and `public/` assets remain untouched.

## 🚀 Quick Start for Colleges

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/your-org/white-label-college-honesty-shop.git
cd white-label-college-honesty-shop

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Customize Your Branding and Content

- **Edit `whitelabel.json`**: This file contains all your app's branding, configuration, and messages. Change the values to match your institution's identity.
- **Update the `public/` folder**: Replace `logo.png`, `favicon.ico`, and any other assets as needed.

### 3. Deploy Your Instance

```bash
# Build the application
npm run build

# The built files will be in the 'dist' folder
# Deploy to your preferred hosting service
```

## 📝 Whitelabel Configuration Example

```json
{
  "app": {
    "name": "Your College Honesty Shop",
    "welcome_points": 100,
    "tagline": "Your Custom Tagline",
    "subtitle": "Your Custom Subtitle",
    "description": "Your college description."
  },
  "branding": {
    "college_name": "Your College Name",
    "portal_name": "Your College Honesty Shop Portal",
    "colors": {
      "primary": "#your-primary-color",
      "secondary": "#your-secondary-color",
      "accent": "#your-accent-color"
    },
    "logo": {
      "url": "/logo.png",
      "fallback": "fallback-logo-url"
    },
    "favicon": "/favicon.png"
  },
  // ... other config sections ...
}
```

## 🛠️ Development

### Local Development
```bash
# Start development server
npm run dev

# Run tests
npm test

# Build and test
npm run build
```

### Upgrading Your Fork
- When you pull new updates from the main repository, your `whitelabel.json` and `public/` folder will not be overwritten.
- Review the release notes for any new required fields in `whitelabel.json` after an upgrade.

## 📚 Documentation

All documentation is now located in the `docs/` folder:
- `docs/getting-started.md`: Step-by-step setup guide
- `docs/college-demo-guide.md`: Demo and feature overview
- `docs/user-guides/admin-guide.md`: Admin user guide
- `docs/user-guides/student-guide.md`: Student user guide

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for Educational Institutions Worldwide**

*No Cameras 📷 | No Cashiers 💳 | Just Character 🫡*