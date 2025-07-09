# Deployment Guide

This comprehensive guide covers all deployment options for the White-Label College Honesty Shop platform, including best practices and troubleshooting.

## Table of Contents
- [Prerequisites](#-prerequisites)
- [Deployment Options](#-deployment-options)
  - [1. Lovable Platform](#1-using-lovable-recommended)
  - [2. Self-Hosted](#2-self-hosted-deployment)
  - [3. Automated College Mirroring](#3-automated-college-mirroring)
- [Environment Configuration](#-environment-configuration)
- [Post-Deployment](#-post-deployment)
- [Scaling](#-scaling)
- [Monitoring](#-monitoring)
- [Backup & Recovery](#-backup--recovery)
- [Troubleshooting](#-troubleshooting)
- [Maintenance](#-maintenance)
- [Security](#-security-considerations)
- [Support](#-support)

## 📋 Prerequisites

Before deployment, ensure you have:

- **Node.js** 16.x or later
- **npm** 8.x or later
- **Git** for version control
- **Supabase** project (for backend services)
- Domain name (recommended for production)
- SSL certificate (auto-configured on most platforms)

## 🚀 Deployment Options

### 1. Using Lovable (Recommended)

#### Benefits
- One-click deployments
- Built-in CI/CD
- Automatic SSL certificates
- Global CDN
- Real-time logs

#### Setup Instructions
1. **Sign up** at [Lovable](https://lovable.app)
2. **Connect** your GitHub/GitLab repository
3. **Import** your Supabase project
4. **Configure** environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_COLLEGE_CODE=your_college_code
   ```
5. **Deploy** with one click

#### Custom Domains
1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL will be provisioned automatically

### 2. Self-Hosted Deployment

#### Build Process
```bash
# Clone the repository
git clone https://github.com/your-org/white-label-college-honesty-shop.git
cd white-label-college-honesty-shop

# Install dependencies
npm ci --production

# Build the application
npm run build
```

#### Deployment Targets

##### Vercel (Recommended)
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Set environment variables in Vercel dashboard

##### Netlify
1. Connect your repository
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables: Add all required variables

##### Static Web Server
1. Copy `dist` contents to your web server
2. Configure URL rewriting:

   **Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

   **Apache**:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

### 3. Automated College Mirroring

For managing multiple college instances:

1. **Fork** the main repository
2. **Configure** GitHub Actions:
   ```yaml
   # .github/workflows/mirror.yml
   name: Mirror to College Repo
   on:
     push:
       branches: [ main ]
   jobs:
     mirror:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Mirror to College Repo
           uses: wei/git-sync@v3
           with:
             source_repo: 'https://github.com/your-org/white-label-college-honesty-shop.git'
             source_branch: 'main'
             destination_repo: '${{ secrets.COLLEGE_REPO_URL }}'
             destination_branch: 'main'
   ```
3. **Set up secrets** in GitHub:
   - `COLLEGE_REPO_TOKEN`: GitHub Personal Access Token with `repo` scope
   - `COLLEGE_REPO_URL`: `https://x-access-token:${GITHUB_TOKEN}@github.com/username/repo.git`

## 🔧 Environment Configuration

### Required Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

# Application
NEXT_PUBLIC_COLLEGE_CODE=your_college_code
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

### Optional Variables
```env
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_MAINTENANCE_MODE=false

# Performance
NEXT_TELEMETRY_DISABLED=1
```

## 🚀 Post-Deployment

### Verification Checklist
1. **Basic Access**
   - [ ] Homepage loads without errors
   - [ ] All static assets load (CSS, JS, images)
   - [ ] No mixed content warnings (HTTPS)

2. **Core Functionality**
   - [ ] User authentication works
   - [ ] Database connections are stable
   - [ ] File uploads/downloads function

3. **Performance**
   - [ ] Page load times < 2s
   - [ ] No console errors
   - [ ] Mobile responsiveness verified

### Monitoring Setup
1. **Error Tracking**
   - Set up Sentry or similar
   - Configure error boundaries
   - Set up alerts for critical errors

2. **Performance Monitoring**
   - Google Analytics
   - Web Vitals monitoring
   - Uptime monitoring

## 📈 Scaling

### Vertical Scaling
- Upgrade server resources (CPU, RAM)
- Enable database read replicas
- Implement caching layer

### Horizontal Scaling
- Use load balancers
- Implement database sharding
- Use CDN for static assets

## 🔍 Monitoring

### Essential Metrics
- **Application**: Response times, error rates
- **Database**: Query performance, connection pool
- **Server**: CPU, memory, disk I/O
- **Network**: Latency, throughput

### Recommended Tools
- **APM**: New Relic, Datadog
- **Logging**: Papertrail, Loggly
- **Uptime**: UptimeRobot, Pingdom

## 💾 Backup & Recovery

### Database Backups
```bash
# Daily backup script example
pg_dump -h your-db-host -U username dbname > backup_$(date +%Y%m%d).sql
```

### File Backups
- Use version control for code
- Regular backups of uploads directory
- Off-site storage for critical data

### Recovery Plan
1. Document recovery procedures
2. Test restore process regularly
3. Keep multiple backup copies

## 🐛 Troubleshooting

### Common Issues

#### 404 Errors on Refresh
**Cause**: Incorrect server configuration for SPA routing  
**Solution**:
```nginx
# Nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### CORS Issues
**Solution**:
1. Update Supabase CORS settings:
   ```sql
   -- In Supabase SQL editor
   update storage.buckets
   set cors = '[{"origin": ["https://your-domain.com"], "method": ["GET", "POST"], "maxAgeSeconds": 3600}]'
   where id = 'your-bucket-name';
   ```

#### Build Failures
1. Check Node.js version: `node -v`
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and `package-lock.json`
4. Reinstall: `npm ci`

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Check for dependency updates
- **Monthly**: Review security advisories
- **Quarterly**: Audit user permissions
- **Annually**: Review infrastructure costs

### Update Process
1. Pull latest changes: `git pull origin main`
2. Update dependencies: `npm update`
3. Test changes locally
4. Deploy to staging
5. Deploy to production

## 🔒 Security Considerations

### Essential Practices
1. **Secrets Management**
   - Never commit secrets to version control
   - Use environment variables
   - Rotate API keys regularly

2. **Dependencies**
   - Audit dependencies: `npm audit`
   - Use Dependabot for updates
   - Pin dependency versions

3. **Infrastructure**
   - Enable firewall rules
   - Regular security scans
   - Keep systems patched

## 📞 Support

### Getting Help
1. **Documentation**: Check our [docs](https://docs.lovable.app)
2. **Community**: [GitHub Discussions](https://github.com/your-org/white-label-college-honesty-shop/discussions)
3. **Support**: support@lovable.app
4. **Emergency**: +1-XXX-XXX-XXXX (24/7)

### Contributing
Found a bug or have a suggestion? Please:
1. Search existing issues
2. Open a new issue with details
3. Follow the contribution guidelines

---

**Last Updated**: July 9, 2025  
**Version**: 2.0.0
