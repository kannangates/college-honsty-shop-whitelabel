const APP_VERSION = '2.0.0'; // Increment this when fixing cache issues

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Check stored version
        const storedVersion = localStorage.getItem('app_version');
        
        // Clear all caches if version mismatch
        if (storedVersion !== APP_VERSION) {
          console.log('🔄 Version mismatch, clearing caches...');
          
          // Unregister all service workers
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
          
          // Clear all caches
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }
          
          // Update stored version
          localStorage.setItem('app_version', APP_VERSION);
          
          // Force reload to get fresh content
          window.location.reload();
          return;
        }
        
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ ServiceWorker registration successful');
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
        
      } catch (err) {
        console.error('❌ ServiceWorker registration failed:', err);
      }
    });
  }
}
