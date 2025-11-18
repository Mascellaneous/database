// Copy to clipboard function
// Dependencies: None

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // Change button text temporarily to show success
        const originalText = button.innerHTML;
        button.innerHTML = '✓';
        button.style.backgroundColor = '#27ae60';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = '';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('複製失敗，請手動複製');
    });
}

// Populate chapter filter options dynamically
function populateChapterFilter() {
    const container = document.getElementById('chapter-options');
    if (!container) return;
    
    let html = '';
    for (let i = 1; i <= 29; i++) {
        const chNumber = String(i).padStart(2, '0');
        // Display just the number, no "Ch" prefix in the button
        html += `<div class="tri-state-checkbox" data-filter="chapter" data-value="${chNumber}" onclick="toggleTriState(this)">${chNumber}</div>`;
    }
    container.innerHTML = html;
}

// Populate curriculum filter options dynamically
function populateCurriculumFilter() {
    const container = document.getElementById('curriculum-dropdown');
    if (!container) return;
    
    const curriculumItems = [
        'A 基本經濟概念',
        'B 廠商與生產',
        'C 市場與價格',
        'D 競爭與市場結構',
        'E 效率、公平和政府的角色',
        'F 經濟表現的量度',
        'G 國民收入決定及價格水平',
        'H 貨幣與銀行',
        'I 宏觀經濟問題和政府',
        'J 國際貿易和金融',
        'E1 選修單元一',
        'E2 選修單元二'
    ];
    
    let html = '';
    curriculumItems.forEach(item => {
        html += `
            <label class="tri-state-label">
                <span class="tri-state-checkbox" data-filter="curriculum" data-value="${item}" onclick="toggleTriState(this)"></span>
                ${item}
            </label>
        `;
    });
    
    container.innerHTML = html;
}

// Populate feature filter options dynamically
function populateFeatureFilter() {
    const container = document.getElementById('feature-dropdown');
    if (!container) return;
    
    const featureItems = [
        '含圖表',
        '含表格',
        '含計算',
        '複選'
    ];
    
    let html = '';
    featureItems.forEach(item => {
        html += `
            <label class="tri-state-label">
                <span class="tri-state-checkbox" data-filter="feature" data-value="${item}" onclick="toggleTriState(this)"></span>
                ${item}
            </label>
        `;
    });
    
    container.innerHTML = html;
}

// Populate curriculum
function populateCurriculumFormOptions() {
    const container = document.querySelector('#curriculum-options .options-list');
    if (!container) return;

    const items = [
        'A 基本經濟概念',
        'B 廠商與生產',
        'C 市場與價格',
        'D 競爭與市場結構',
        'E 效率、公平和政府的角色',
        'F 經濟表現的量度',
        'G 國民收入決定及價格水平',
        'H 貨幣與銀行',
        'I 宏觀經濟問題和政府',
        'J 國際貿易和金融',
        'E1 選修單元一',
        'E2 選修單元二'
    ];

    container.innerHTML = items.map(item => `
        <label><input type="checkbox" value="${item}"> ${item}</label>
    `).join('');
}