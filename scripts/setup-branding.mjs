#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// File paths
const brandingConfigPath = path.join(__dirname, '../src/config/branding.ts');
const templatePath = path.join(__dirname, 'templates/branding.template.ts');
const publicDir = path.join(__dirname, '../public');
const imagesDir = path.join(publicDir, 'images');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
const question = (query) => {
  return new Promise(resolve => rl.question(query, resolve));
};

// Main function
const runSetup = async () => {
  console.log('\n🚀 Welcome to the Shasun College Branding Setup 🎨\n');
  
  // Check if branding config exists
  if (fs.existsSync(brandingConfigPath)) {
    const overwrite = await question('⚠️  Branding configuration already exists. Overwrite? (y/N) ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  // Create images directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Collect branding information
  console.log('\n📝 Please provide the following information about your college:');
  
  const collegeName = await question('College Name (Shasun College): ') || 'Shasun College';
  const shortName = await question(`Short Name (${collegeName.split(' ')[0]}): `) || collegeName.split(' ')[0];
  const location = await question('Location (Chennai, India): ') || 'Chennai, India';
  const website = await question('Website (https://shasuncbe.edu.in): ') || 'https://shasuncbe.edu.in';
  const email = await question('Contact Email (info@shasuncbe.edu.in): ') || 'info@shasuncbe.edu.in';
  const phone = await question('Contact Phone (+91 44 2442 4200): ') || '+91 44 2442 4200';
  const address = await question('Full Address: ') || '864, Poonamallee High Road, Kilpauk, Chennai - 600010';
  
  // Portal information
  console.log('\n🌐 Portal Information:');
  const portalName = await question('Portal Name (Campus Connect): ') || 'Campus Connect';
  const portalDescription = await question('Portal Description: ') || `${collegeName} Student Portal`;
  
  // Theme colors
  console.log('\n🎨 Theme Colors (press Enter to use defaults):');
  const primaryColor = await question(`Primary Color (#1976d2): `) || '#1976d2';
  const secondaryColor = await question(`Secondary Color (#9c27b0): `) || '#9c27b0';
  const accentColor = await question(`Accent Color (#ff4081): `) || '#ff4081';
  
  // Social media
  console.log('\n🔗 Social Media Links (press Enter to skip any):');
  const facebook = await question('Facebook: ');
  const twitter = await question('Twitter: ');
  const instagram = await question('Instagram: ');
  const linkedin = await question('LinkedIn: ');
  const youtube = await question('YouTube: ');
  
  // Handle logo
  console.log('\n🖼️  Logo Setup:');
  console.log(`Please place your logo.png (recommended size: 200x50px) in the ${imagesDir} directory`);
  const hasLogo = await question('Have you placed the logo file? (Y/n) ') !== 'n';
  
  // Generate branding config
  const brandingConfig = `// Auto-generated branding configuration for ${collegeName}
// Generated on: ${new Date().toISOString()}

import { BrandingConfig } from './branding.types';

const branding: BrandingConfig = {
  college: {
    name: '${collegeName.replace(/'/g, "\\'")}',
    shortName: '${shortName.replace(/'/g, "\\'")}',
    location: '${location.replace(/'/g, "\\'")}',
    website: '${website}',
    email: '${email}',
    phone: '${phone.replace(/'/g, "\\'")}',
    address: '${address.replace(/'/g, "\\'")}',
    logo: '${hasLogo ? '/images/logo.png' : '/images/college-logo.png'}',
    favicon: '/favicon.ico',
  },
  portal: {
    name: '${portalName.replace(/'/g, "\\'")}',
    description: '${portalDescription.replace(/'/g, "\\'")}',
    version: '1.0.0',
    themeColor: '${primaryColor}',
  },
  theme: {
    colors: {
      primary: '${primaryColor}',
      secondary: '${secondaryColor}',
      accent: '${accentColor}',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
    },
  },
  features: {
    darkMode: true,
    notifications: true,
    announcements: true,
    events: true,
    attendance: true,
    assignments: true,
    results: true,
    library: true,
    hostel: true,
    transport: true,
    fees: true,
    alumni: true,
  },
  social: {
    ${facebook ? `facebook: '${facebook}',` : ''}
    ${twitter ? `twitter: '${twitter}',` : ''}
    ${instagram ? `instagram: '${instagram}',` : ''}
    ${linkedin ? `linkedin: '${linkedin}',` : ''}
    ${youtube ? `youtube: '${youtube}',` : ''}
  },
};

export default branding;
`;

  // Write branding config
  fs.writeFileSync(brandingConfigPath, brandingConfig);
  
  // Copy default logo if none exists
  if (!hasLogo && !fs.existsSync(path.join(imagesDir, 'college-logo.png'))) {
    // You would copy a default logo here if available
    console.log('ℹ️  Using default Shasun College logo');
  }
  
  console.log('\n✅ Branding configuration complete!');
  console.log(`📄 Configuration saved to: ${brandingConfigPath}`);
  console.log('\nNext steps:');
  console.log('1. Replace the logo.png in the public/images directory with your college logo');
  console.log('2. Update the favicon.ico in the public directory');
  console.log('3. Run the app to see your new branding in action!\n');
  
  rl.close();
};

// Run the setup
runSetup().catch(err => {
  console.error('❌ Error during setup:', err);
  process.exit(1);
});
