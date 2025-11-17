// Configuration file for Google Sheets sync
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzB5qn7YzK-UOaxcWHRGVd-MOGMVQQS_aKZ9UJbo4gnsF0ZFpggAoXYR-gWQkSsOzso/exec'
};

// Initialize sync on page load
window.addEventListener('DOMContentLoaded', async () => {
    if (CONFIG.GOOGLE_APPS_SCRIPT_URL && CONFIG.GOOGLE_APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        window.googleSheetsSync = new GoogleSheetsSync(CONFIG.GOOGLE_APPS_SCRIPT_URL);
        console.log('✅ Google Sheets Sync initialized with hardcoded URL');
    } else {
        console.warn('⚠️ Google Apps Script URL not configured in config.js');
    }
});