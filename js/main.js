/* ============================================
   Main Application Initialization
   ============================================ */

// Initialize application
async function init() {
    // Show loading state
    showLoadingState(true);
    
    window.storage = new IndexedDBStorage();
    
    try {
        await window.storage.init();
        const statusElement = document.getElementById('storage-status');
        if (statusElement) {
            statusElement.textContent = '✓ 資料庫已連接';
            statusElement.classList.add('connected');
            statusElement.style.color = '#27ae60';
        }
    } catch (error) {
        console.error('Failed to initialize storage:', error);
        const statusElement = document.getElementById('storage-status');
        if (statusElement) {
            statusElement.textContent = '✗ 資料庫連接失敗';
            statusElement.classList.add('disconnected');
            statusElement.style.color = '#e74c3c';
        }
    }
    
    // Auto-sync from Google Sheets on page load (via config.js)
    // The config.js file will initialize window.googleSheetsSync automatically
    if (window.googleSheetsSync) {
        try {
            console.log('📥 開始從 Google Sheets 載入資料...');
            const result = await window.googleSheetsSync.syncOnLoad();
            
            if (result.success) {
                const statusElement = document.getElementById('sync-status');
                if (statusElement) {
                    window.googleSheetsSync.updateSyncStatus(result);
                }
                console.log('✅ Google Sheets 資料載入完成');
            }
        } catch (error) {
            console.error('Failed to sync on load:', error);
            // Don't show alert on initial load, just log the error
            console.warn('⚠️ Google Sheets 同步失敗:', error.message);
        }
    }
    
    setupFormHandler();
    setupEventListeners();
    // Initialize percentage slider
    if (document.getElementById('min-percentage')) {
        updateDualRange();
    }    
    await populateYearFilter();
    await renderQuestions();
    await refreshStatistics();
    
    // Hide loading state after everything is loaded
    showLoadingState(false);
}

// Show/Hide loading state
function showLoadingState(show) {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

// Manual sync (reload from Google Sheets)
async function manualSync() {
    if (!window.googleSheetsSync) {
        alert('Google Sheets 未設定，請檢查 config.js');
        return;
    }
    
    try {
        showLoading('正在從 Google Sheets 載入資料...');
        
        const result = await window.googleSheetsSync.syncOnLoad();
        
        hideLoading();
        
        if (result.success) {
            const statusElement = document.getElementById('sync-status');
            if (statusElement) {
                window.googleSheetsSync.updateSyncStatus(result);
            }
            await refreshViews();
            alert(`✅ 同步成功！\n\n匯入 ${result.count} 題`);
        }
    } catch (error) {
        hideLoading();
        alert('❌ 同步失敗: ' + error.message);
    }
}

// Helper functions
function showLoading(message) {
    let loader = document.getElementById('loading-overlay');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loading-overlay';
        loader.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); display: flex;
            align-items: center; justify-content: center; z-index: 9999;
        `;
        document.body.appendChild(loader);
    }
    loader.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 15px;">⏳</div>
            <div style="font-size: 16px; color: #333;">${message}</div>
        </div>
    `;
}

function hideLoading() {
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.remove();
}

async function refreshViews() {
    await populateYearFilter();
    await renderQuestions();
    await refreshStatistics();
}

// Tab switching
function switchTab(tabName) {
    window.currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Render content based on tab
    if (tabName === 'publishers') {
        renderPublishers();
    } else if (tabName === 'topics') {
        renderTopics();
    } else if (tabName === 'concepts') {
        renderConcepts();
    } else if (tabName === 'patterns') {
        renderPatterns();
    }
}

// Event listeners
function setupEventListeners() {
    document.getElementById('search').addEventListener('input', debounce(filterQuestions, 300));
    document.getElementById('exam-filter').addEventListener('change', filterQuestions);
    document.getElementById('year-filter').addEventListener('change', filterQuestions);
    document.getElementById('qtype-filter').addEventListener('change', filterQuestions);
    
    // Scroll to top button
    window.addEventListener('scroll', () => {
        const scrollBtn = document.getElementById('scroll-to-top');
        if (scrollBtn && window.pageYOffset > 300) {
            scrollBtn.style.display = 'block';
        } else if (scrollBtn) {
            scrollBtn.style.display = 'none';
        }
    });
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Populate year filter
async function populateYearFilter() {
    const questions = await window.storage.getQuestions();
    const years = [...new Set(questions.map(q => q.year))].sort((a, b) => b - a);
    
    const yearFilter = document.getElementById('year-filter');
    yearFilter.innerHTML = '<option value="">全部年份</option>';
    
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// Clear database
async function clearDatabase() {
    if (confirm('確定要清除所有資料？此操作無法復原！')) {
        if (confirm('請再次確認：真的要刪除所有題目嗎？')) {
            await window.storage.clear();
            await refreshViews();
            alert('資料庫已清空');
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}