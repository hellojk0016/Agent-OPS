/**
 * Forceful PWA Removal Script
 * 
 * This script will:
 * 1. Unregister all service workers.
 * 2. Delete all named caches.
 * 3. (Optional) Reload the page to ensure a clean state.
 * 
 * Copy and paste this into your browser's console (F12 > Console).
 */

async function forceRemovePWA() {
  console.log('--- Starting Forceful PWA Removal ---');

  // 1. Unregister Service Workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        const success = await registration.unregister();
        console.log(`Unregistered SW: ${registration.scope} - Success: ${success}`);
      }
    } catch (error) {
      console.error('Error unregistering Service Workers:', error);
    }
  } else {
    console.log('Service Workers not supported in this browser.');
  }

  // 2. Delete Caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        const success = await caches.delete(name);
        console.log(`Deleted Cache: ${name} - Success: ${success}`);
      }
    } catch (error) {
      console.error('Error deleting Caches:', error);
    }
  } else {
    console.log('Cache API not supported in this browser.');
  }

  // 3. Clear Local Storage / Session Storage (Optional but recommended)
  // localStorage.clear();
  // sessionStorage.clear();
  // console.log('Storage cleared.');

  console.log('--- PWA Removal Complete ---');
  console.log('Please reload the page (Ctrl + F5).');
}

forceRemovePWA();
