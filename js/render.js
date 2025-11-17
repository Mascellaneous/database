// Render questions
async function renderQuestions() {
    const filters = {
        search: document.getElementById('search').value,
        examination: document.getElementById('exam-filter').value,
        year: document.getElementById('year-filter').value,
        questionType: document.getElementById('qtype-filter').value,
        triState: triStateFilters
    };
    
    const questions = await storage.getQuestions(filters);
    
    const currentPage = paginationState.questions.page;
    const itemsPerPage = paginationState.questions.itemsPerPage;
    
    const totalPages = itemsPerPage === -1 ? 1 : Math.max(1, Math.ceil(questions.length / itemsPerPage));
    const paginatedQuestions = itemsPerPage === -1 ? questions : questions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    updatePaginationInfo(currentPage, questions.length, itemsPerPage);
    generatePagination(currentPage, totalPages);
    
    document.getElementById('question-count').textContent = `總題目數: ${questions.length}`;
    
    const grid = document.getElementById('question-grid');
    
    if (questions.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #7f8c8d;">未找到題目</p>';
        return;
    }
    
    grid.innerHTML = paginatedQuestions.map(q => `
        <div class="question-card">
            <div class="question-header">
                <div class="question-title">
                    ${q.id} - ${q.examination} ${q.year} ${q.section ? `卷${q.section}` : ''} ${q.questionNumber ? `第${q.questionNumber}題` : ''}
                </div>
                <div class="question-badges">
                    <span class="badge badge-year">${q.year}</span>
                    <span class="badge badge-type">${q.questionType}</span>
                    ${q.marks > 0 ? `<span class="badge badge-marks">${q.marks}分</span>` : ''}
                    ${q.section ? `<span class="badge badge-section">卷${q.section}</span>` : ''}
                </div>
            </div>
            
            <div class="question-content">
                ${q.questionTextChi ? `
                    <div class="question-text">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                            <strong>題目 (中):</strong>
                            <button class="copy-btn" onclick="copyToClipboard(${JSON.stringify(q.questionTextChi).replace(/"/g, '&quot;')}, this)" title="複製">
                                📋
                            </button>
                        </div>
                        <div>${q.questionTextChi.substring(0, 200)}${q.questionTextChi.length > 200 ? '...' : ''}</div>
                    </div>
                ` : ''}
                ${q.questionTextEng ? `
                    <div class="question-text">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                            <strong>Question (Eng):</strong>
                            <button class="copy-btn" onclick="copyToClipboard(${JSON.stringify(q.questionTextEng).replace(/"/g, '&quot;')}, this)" title="Copy">
                                📋
                            </button>
                        </div>
                        <div>${q.questionTextEng.substring(0, 200)}${q.questionTextEng.length > 200 ? '...' : ''}</div>
                    </div>
                ` : ''}
                
                <div class="question-info">
                    ${q.publisher ? `<div class="info-item"><strong>出版商:</strong> ${q.publisher}</div>` : ''}
                    ${q.multipleSelectionType !== '-' ? `<div class="info-item"><strong>多選題:</strong> ${q.multipleSelectionType}</div>` : ''}
                    ${q.graphType !== '-' ? `<div class="info-item"><strong>圖表:</strong> ${q.graphType}</div>` : ''}
                    ${q.tableType !== '-' ? `<div class="info-item"><strong>表格:</strong> ${q.tableType}</div>` : ''}
                    ${q.correctPercentage !== null ? `<div class="info-item"><strong>答對率:</strong> ${q.correctPercentage}%</div>` : ''}
                </div>
                
                ${q.answer ? `<div class="info-item"><strong>答案:</strong> ${q.answer}</div>` : ''}
                
                ${q.curriculumClassification && q.curriculumClassification.length > 0 ? `
                    <div>
                        <strong>課程分類:</strong>
                        <div class="tag-container">
                            ${q.curriculumClassification.map(c => `<span class="tag">${c}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${q.concepts && q.concepts.length > 0 ? `
                    <div>
                        <strong>涉及概念:</strong>
                        <div class="tag-container">
                            ${q.concepts.map(c => `<span class="tag">${c}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${q.patternTags && q.patternTags.length > 0 ? `
                    <div>
                        <strong>題型:</strong>
                        <div class="tag-container">
                            ${q.patternTags.map(p => `<span class="tag">${p}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${q.markersReport ? `<div class="info-item" style="margin-top: 10px;"><strong>評卷報告:</strong> ${q.markersReport.substring(0, 150)}${q.markersReport.length > 150 ? '...' : ''}</div>` : ''}
            </div>
            
            ${isAdminMode ? `
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn btn-warning" onclick="editQuestion('${q.id}')">編輯</button>
                    <button class="btn btn-danger" onclick="deleteQuestion('${q.id}')">刪除</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Copy to clipboard function
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