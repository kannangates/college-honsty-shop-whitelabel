# White-Label College Honesty Shop 🏫

A modern, white-labeled honesty shop management system that can be easily customized for any educational institution. Built with enterprise-grade security, performance optimization, and ISO compliance.

## 🌟 Features

### 🎨 **White-Label Ready**
- **Multi-College Support**: Easy branding configuration for different institutions
- **Dynamic Theming**: Automatic color scheme and branding application
- **Customizable Content**: Institution-specific messages, forms, and configurations
- **Logo & Asset Management**: Custom logos and visual identity support

### 🔐 **Authentication & Security**
- Multi-factor Authentication with secure login/signup
- Role-based Access Control (Student, Teacher, Admin)
- Advanced session management with automatic renewal
- Real-time security monitoring and compliance checking
- Comprehensive audit logging for compliance

### 🏪 **Shop Management**
- Product catalog with real-time inventory tracking
- Honor-based transaction system
- Order management with complete lifecycle tracking
- Secure payment processing with multiple methods
- Points & rewards system with gamification

### 📊 **Analytics & Reporting**
- Comprehensive admin dashboard with analytics
- Real-time performance monitoring
- Financial reports and transaction insights
- User engagement analytics
- ISO compliance automated reporting

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

# Set your college code in .env
echo "COLLEGE_CODE=your_college_name" >> .env
```

### 2. Configure Your College Branding

Create your college's branding folder:
```bash
mkdir -p branding/your_college_name
```

Copy and customize the configuration files:
```bash
# Copy from an existing example
cp -r branding/default/* branding/your_college_name/

# Or start from scratch with the templates below
```

### 3. Customize Your Configuration

#### `branding/your_college_name/theme.json`
```json
{
  "name": "Your College Name",
  "portal_name": "Your College Honesty Shop Portal",
  "tagline": "Your Custom Tagline",
  "subtitle": "Your Custom Subtitle",
  "description": "Your college description",
  "colors": {
    "primary": "#your-primary-color",
    "secondary": "#your-secondary-color", 
    "accent": "#your-accent-color"
  },
  "logo": {
    "url": "/your-logo.png",
    "fallback": "fallback-logo-url"
  },
  "favicon": "/your-favicon.png"
}
```

#### `branding/your_college_name/config.json`
Customize app settings, form labels, and system configurations.

#### `branding/your_college_name/messages.json`
Customize all text content, error messages, and UI labels.

### 4. Deploy Your Instance

```bash
# Build the application
npm run build

# The built files will be in the 'dist' folder
# Deploy to your preferred hosting service
```

## 🎨 Branding System

The white-label system supports multiple colleges through a flexible branding structure:

```
branding/
├── default/          # Default demo branding
├── shasun/          # Shasun Engineering College (example)
├── college_a/       # Example College A
├── college_b/       # Example College B
└── your_college/    # Your custom branding
    ├── theme.json   # Visual branding (colors, logos, names)
    ├── config.json  # App configuration (forms, system settings)
    └── messages.json # All text content and messages
```

### College Detection Methods

The system automatically detects which college configuration to use:

1. **Environment Variable**: Set `COLLEGE_CODE=your_college_name` in `.env`
2. **Subdomain Detection**: `collegea.yourdomain.com` → loads `college_a` branding
3. **Fallback**: Uses `default` branding if detection fails

## 🔧 Advanced Configuration

### Custom Domain Setup
1. Configure your college's subdomain to point to your deployment
2. Set `VITE_BASE_DOMAIN=yourdomain.com` in your environment
3. The system will automatically detect the college from the subdomain

### Color System
The branding system uses CSS custom properties for theming:
- Colors are automatically converted from hex to HSL
- Supports both light and dark mode variations
- Maintains accessibility standards with proper contrast

### Form Customization
Each college can customize:
- Field labels (Student ID vs Roll Number)
- Placeholder text
- Available options (shifts, roles, departments)
- Validation rules and messages

## 🚀 Deployment Options

### 1. Using Lovable (Recommended)
- Connect to Supabase for backend functionality
- Use the built-in deployment system
- Configure custom domains in project settings

### 2. Self-Hosted Deployment
```bash
# Build for production
npm run build

# Deploy the 'dist' folder to:
# - Vercel, Netlify, or similar static hosting
# - Your own web server
# - CDN with proper routing for SPA
```

### 3. Automated College Mirroring

The repository includes GitHub Actions for automatic code mirroring to college-specific repositories:

1. Fork this repository as your white-label base
2. Set up secrets in GitHub:
   - `COLLEGE_REPO_TOKEN`: GitHub PAT with push access
   - `COLLEGE_REPO_URL`: Target college repository URL
3. Push to `main` branch triggers automatic mirroring

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

### Creating New College Configurations
1. Copy an existing college folder in `branding/`
2. Customize the three JSON files
3. Test locally by setting `COLLEGE_CODE` in `.env`
4. Deploy when ready

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📚 Example Configurations

### Engineering College
```json
{
  "name": "ABC Engineering College",
  "colors": {
    "primary": "#1e40af",
    "secondary": "#dc2626",
    "accent": "#f3f4f6"
  }
}
```

### Business School
```json
{
  "name": "XYZ Business School",
  "colors": {
    "primary": "#059669",
    "secondary": "#0891b2",
    "accent": "#ecfdf5"
  }
}
```

## 🔒 Security & Compliance

- **ISO 9001/27001** compliant architecture
- **SOC 2** security controls
- **GDPR** data protection compliance
- Real-time security monitoring
- Comprehensive audit logging
- Automated vulnerability scanning

## 📞 Support & Documentation

### For Colleges
- [Setup Guide](docs/setup-guide.md)
- [Customization Guide](docs/customization-guide.md)
- [Deployment Guide](docs/deployment-guide.md)

### For Developers
- [Technical Documentation](docs/technical-docs.md)
- [API Reference](docs/api-reference.md)
- [Contributing Guide](CONTRIBUTING.md)

### Community
- [GitHub Issues](https://github.com/your-org/white-label-college-honesty-shop/issues)
- [Discussions](https://github.com/your-org/white-label-college-honesty-shop/discussions)
- [Discord Community](https://discord.com/invite/lovable)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Mobile app versions
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Third-party integrations (payment gateways, LMS)
- [ ] White-label admin panel
- [ ] API marketplace for extensions

---

**Built with ❤️ for Educational Institutions Worldwide**

*No Cameras 📷 | No Cashiers 💳 | Just Character 🫡*

## 🌟 Live Examples

- **Shasun Engineering College**: [demo-shasun.lovable.app](https://demo-shasun.lovable.app)
- **Example College A**: [demo-collegea.lovable.app](https://demo-collegea.lovable.app)
- **Example College B**: [demo-collegeb.lovable.app](https://demo-collegeb.lovable.app)
- **Default Demo**: [demo-default.lovable.app](https://demo-default.lovable.app)