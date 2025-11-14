#!/usr/bin/env node

/**
 * Script to help clear browser cache and service workers
 * Run this after deployment to ensure users get the latest version
 */

console.log('\n🧹 Browser Cache Clearing Instructions\n');
console.log('To fix the blank screen issue, users need to clear their cache:\n');
console.log('Option 1: Visit the cache clearing page');
console.log('  → Navigate to: https://your-domain.com/clear-cache.html');
console.log('  → This will automatically clear all caches and service workers\n');

console.log('Option 2: Manual browser cache clear');
console.log('  Chrome/Edge:');
console.log('    1. Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)');
console.log('    2. Select "Cached images and files"');
console.log('    3. Click "Clear data"\n');
console.log('  Firefox:');
console.log('    1. Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)');
console.log('    2. Select "Cache"');
console.log('    3. Click "Clear Now"\n');
console.log('  Safari:');
console.log('    1. Press Cmd+Option+E');
console.log('    2. Or Safari > Clear History > All History\n');

console.log('Option 3: Hard refresh');
console.log('  → Press Ctrl+Shift+R (Cmd+Shift+R on Mac)');
console.log('  → Or Ctrl+F5 (Windows/Linux)\n');

console.log('Option 4: Unregister service workers manually');
console.log('  1. Open DevTools (F12)');
console.log('  2. Go to Application tab');
console.log('  3. Click "Service Workers" in the left sidebar');
console.log('  4. Click "Unregister" for all service workers');
console.log('  5. Go to "Storage" in the left sidebar');
console.log('  6. Click "Clear site data"\n');

console.log('✅ After clearing cache, the app should load correctly.\n');
