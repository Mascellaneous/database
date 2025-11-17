// Authentication and Authorization with Cookie Support
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.displayName = null;
        this.userGroup = null;
        this.COOKIE_NAME = 'econ_db_auth';
        this.COOKIE_DAYS = 365; // Cookie expires after 365 days (1 year)
    }
    
    // Check if user is logged in (from cookie)
    isAuthenticated() {
        const cookieData = this.getCookie(this.COOKIE_NAME);
        if (cookieData) {
            try {
                const userData = JSON.parse(decodeURIComponent(cookieData));
                this.currentUser = userData.username;
                this.displayName = userData.displayName;
                this.userGroup = userData.userGroup;
                return true;
            } catch (e) {
                this.deleteCookie(this.COOKIE_NAME);
                return false;
            }
        }
        return false;
    }
    
    // Save user credentials to cookie
    saveUser(username, displayName, userGroup) {
        const userData = {
            username: username,
            displayName: displayName,
            userGroup: userGroup,
            loginTime: new Date().toISOString()
        };
        
        this.currentUser = username;
        this.displayName = displayName;
        this.userGroup = userGroup;
        
        // Save to cookie
        this.setCookie(this.COOKIE_NAME, JSON.stringify(userData), this.COOKIE_DAYS);
    }
    
    // Logout - clear cookie
    logout() {
        this.deleteCookie(this.COOKIE_NAME);
        this.currentUser = null;
        this.displayName = null;
        this.userGroup = null;
        window.location.reload();
    }
    
    // Cookie helper functions
    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/;SameSite=Strict";
    }
    
    getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }
        return null;
    }
    
    deleteCookie(name) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    }
    
    // Check permissions
    canEdit() {
        return this.userGroup === 'Admin';
    }
}

// Initialize auth manager
window.authManager = new AuthManager();

// Show login modal
function showLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 45px; border-radius: 16px; max-width: 450px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 15px;">🔐</div>
                <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 24px;">
                    經濟題目資料庫
                </h2>
                <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
                    請輸入您的使用者名稱以繼續
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: #2c3e50; font-weight: 600; font-size: 14px;">
                    使用者名稱
                </label>
                <input type="text" id="username-input" 
                       placeholder="請輸入您的名稱"
                       autocomplete="username"
                       style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; box-sizing: border-box; transition: border-color 0.3s;">
                <div id="login-error" style="color: #e74c3c; margin-top: 10px; font-size: 13px; display: none; padding: 10px; background: #ffe6e6; border-radius: 6px;"></div>
            </div>
            
            <button onclick="attemptLogin()" id="login-button"
                    style="width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                登入
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add hover effect to button
    const loginBtn = document.getElementById('login-button');
    loginBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });
    loginBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });
    
    // Add focus effect to input
    const usernameInput = document.getElementById('username-input');
    usernameInput.addEventListener('focus', function() {
        this.style.borderColor = '#667eea';
        this.style.outline = 'none';
    });
    usernameInput.addEventListener('blur', function() {
        this.style.borderColor = '#e0e0e0';
    });
    
    // Focus on input
    usernameInput.focus();
    
    // Allow Enter key to submit
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            attemptLogin();
        }
    });
}

// Attempt login
async function attemptLogin() {
    const username = document.getElementById('username-input').value.trim().toLowerCase();
    const errorDiv = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-button');
    
    if (!username) {
        errorDiv.innerHTML = '⚠️ 請輸入使用者名稱';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Disable button during login
    loginBtn.disabled = true;
    loginBtn.textContent = '登入中...';
    loginBtn.style.background = '#95a5a6';
    loginBtn.style.cursor = 'not-allowed';
    
    try {
        showLoading('正在驗證使用者...');
        
        // Verify user with Google Apps Script
        const response = await fetch(`${window.googleSheetsSync.webAppUrl}?username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
            throw new Error('無法連接伺服器');
        }
        
        // Try to parse JSON - catch if it's not JSON
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            throw new Error('伺服器回應格式錯誤');
        }
        
        // Check for error before proceeding
        if (result.error) {
            hideLoading();
            errorDiv.innerHTML = '❌ ' + result.message;
            errorDiv.style.display = 'block';
            
            // Re-enable button
            loginBtn.disabled = false;
            loginBtn.textContent = '登入';
            loginBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            loginBtn.style.cursor = 'pointer';
            return;
        }
        
        // Only proceed if login successful
        if (!result.success) {
            hideLoading();
            errorDiv.innerHTML = '❌ 登入失敗';
            errorDiv.style.display = 'block';
            
            // Re-enable button
            loginBtn.disabled = false;
            loginBtn.textContent = '登入';
            loginBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            loginBtn.style.cursor = 'pointer';
            return;
        }
        
        // Save user credentials to cookie
        window.authManager.saveUser(result.username, result.displayName, result.userGroup);
        
        // Remove login modal
        document.getElementById('login-modal').remove();
        
        hideLoading();
        
        // Show welcome message
        showWelcomeMessage(result.displayName);
        
        // Initialize storage first, then load data
        if (result.data) {
            showLoading('正在初始化資料庫...');
            
            // Initialize storage if needed
            if (!window.storage) {
                window.storage = new IndexedDBStorage();
                await window.storage.init();
            }
            
            // Load the data
            await loadAuthenticatedData(result.data);
            
            // Initialize the rest of the app
            await initializeApp();
        } else {
            console.error('No data received from server');
            alert('❌ 伺服器未返回資料');
        }
        
    } catch (error) {
        hideLoading();
        console.error('Login error:', error);
        
        // Better error messages
        let errorMessage = '登入失敗';
        
        if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
            errorMessage = '使用者名稱錯誤或無權限';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = '無法連接伺服器，請檢查網路';
        } else {
            errorMessage = error.message;
        }
        
        errorDiv.innerHTML = '❌ ' + errorMessage;
        errorDiv.style.display = 'block';
        
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.textContent = '登入';
        loginBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        loginBtn.style.cursor = 'pointer';
    }
}

// Show welcome message
function showWelcomeMessage(displayName) {
    const welcome = document.createElement('div');
    welcome.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        color: #2c3e50;
        padding: 20px 28px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.4s ease-out;
        border-left: 4px solid #667eea;
        min-width: 280px;
    `;
    
    welcome.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 28px;">👋</div>
            <div>
                <div style="font-weight: bold; font-size: 16px; color: #2c3e50;">登入成功</div>
                <div style="font-size: 13px; color: #7f8c8d; margin-top: 2px;">
                    歡迎回來, ${displayName}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(welcome);
    
    setTimeout(() => {
        welcome.style.animation = 'slideOut 0.4s ease-out';
        setTimeout(() => welcome.remove(), 400);
    }, 3000);
}

// Load authenticated data
async function loadAuthenticatedData(data) {
    try {
        showLoading('正在載入題目資料...');
        
        // Parse the data
        const lines = data.split(String.fromCharCode(31)).filter(line => line.trim());
        
        if (lines.length < 1) {
            throw new Error('資料為空');
        }
        
        const headers = lines[0].split(String.fromCharCode(30));
        const questions = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(String.fromCharCode(30));
            const question = {
                dateAdded: new Date().toISOString(),
                dateModified: new Date().toISOString()
            };
            
            headers.forEach((header, index) => {
                const trimmedHeader = header.trim();
                const dbField = window.googleSheetsSync.columnMappings[trimmedHeader];
                
                if (!dbField) return;
                
                let value = values[index] || '';
                
                if (!value) {
                    // Initialize array fields as empty arrays
                    if (['curriculumClassification', 'chapterClassification', 'concepts', 'patternTags'].includes(dbField)) {
                        question[dbField] = [];
                    }
                    return;
                }
                
                // Process based on field type
                switch (dbField) {
                    case 'year':
                    case 'marks':
                    case 'correctPercentage':
                        const num = parseFloat(value.trim());
                        if (!isNaN(num)) {
                            question[dbField] = num;
                        }
                        break;
                    
                    case 'curriculumClassification':
                    case 'chapterClassification':
                    case 'concepts':
                    case 'patternTags':
                        // Convert comma-separated strings to arrays
                        const trimmedValue = value.trim();
                        if (trimmedValue) {
                            question[dbField] = trimmedValue.split(',').map(s => s.trim()).filter(s => s);
                        } else {
                            question[dbField] = [];
                        }
                        break;
                    
                    case 'multipleSelectionType':
                    case 'graphType':
                    case 'tableType':
                        question[dbField] = value.trim() || '-';
                        break;
                    
                    case 'questionTextChi':
                    case 'questionTextEng':
                    case 'markersReport':
                    case 'remarks':
                        // Preserve newlines
                        question[dbField] = value.replace(/\\n/g, '\n').trim();
                        break;
                    
                    default:
                        question[dbField] = value.trim();
                }
            });
            
            // Ensure array fields exist
            ['curriculumClassification', 'chapterClassification', 'concepts', 'patternTags'].forEach(field => {
                if (!question[field]) {
                    question[field] = [];
                }
            });
            
            if (question.examination && question.id) {
                questions.push(question);
            }
        }
        
        // Clear and reload database
        await window.storage.clear();
        
        for (const question of questions) {
            await window.storage.addQuestion(question);
        }
        
        hideLoading();
        
        console.log(`✅ 已載入 ${questions.length} 題`);
        
    } catch (error) {
        hideLoading();
        console.error('Data load error:', error);
        alert('❌ 資料載入失敗: ' + error.message);
    }
}

// Initialize app after login
async function initializeApp() {
    try {
        console.log('🔧 初始化應用程式介面...');
        
        setupFormHandler();
        setupEventListeners();
        
        // Initialize percentage slider
        if (document.getElementById('min-percentage')) {
            updateDualRange();
        }
        
        await populateYearFilter();
        await renderQuestions();
        await refreshStatistics();
        
        console.log('✅ 應用程式初始化完成');
        
    } catch (error) {
        console.error('App initialization error:', error);
        alert('❌ 應用程式初始化失敗: ' + error.message);
    }
}