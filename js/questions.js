// Setup form handler
function setupFormHandler() {
    const form = document.getElementById('question-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            exam: document.getElementById('exam').value.trim(),
            year: document.getElementById('year').value.trim() || null,
            section: document.getElementById('section').value.trim(),
            qnumber: document.getElementById('qnumber').value.trim(),
            qtype: document.getElementById('qtype').value,
            publisher: document.getElementById('publisher').value.trim() || null,
            topic: document.getElementById('topic').value.trim() || null,
            concepts: document.getElementById('concepts').value.trim() || null,
            pattern: document.getElementById('pattern').value.trim() || null,
            marks: document.getElementById('marks').value || null,
            comment: document.getElementById('comment').value.trim() || null
        };

        // Check for duplicates
        const isDuplicate = await checkDuplicate(formData);
        if (isDuplicate) {
            if (!confirm('已存在相同的題目（考試、年份、章節、題號相同）。確定要新增嗎？')) {
                return;
            }
        }

        try {
            await window.storage.addQuestion(formData);
            form.reset();
            await refreshViews();
            alert('題目已新增！');
        } catch (error) {
            console.error('Failed to add question:', error);
            alert('新增失敗，請重試');
        }
    });
}

// Check for duplicate questions
async function checkDuplicate(formData) {
    const questions = await window.storage.getQuestions();
    return questions.some(q => 
        q.exam === formData.exam &&
        q.year === formData.year &&
        q.section === formData.section &&
        q.qnumber === formData.qnumber
    );
}

// Render questions list
async function renderQuestions() {
    const questions = await window.storage.getQuestions();
    const filteredQuestions = filterQuestionsList(questions);
    
    const container = document.getElementById('questions-list');
    document.getElementById('questions-count').textContent = filteredQuestions.length;
    
    if (filteredQuestions.length === 0) {
        container.innerHTML = '<p class="empty-state">暫無題目</p>';
        return;
    }
    
    container.innerHTML = filteredQuestions.map(q => `
        <div class="question-card">
            <div class="question-header">
                <h3>${q.exam}${q.year ? ` ${q.year}` : ''} - ${q.section} - Q${q.qnumber}</h3>
                <button onclick="deleteQuestion(${q.id})" class="btn-danger">刪除</button>
            </div>
            <div class="question-details">
                ${q.qtype ? `<span class="tag">題型: ${q.qtype}</span>` : ''}
                ${q.publisher ? `<span class="tag">出版社: ${q.publisher}</span>` : ''}
                ${q.topic ? `<span class="tag">主題: ${q.topic}</span>` : ''}
                ${q.pattern ? `<span class="tag">模式: ${q.pattern}</span>` : ''}
                ${q.marks ? `<span class="tag">分數: ${q.marks}</span>` : ''}
            </div>
            ${q.concepts ? `<div class="concepts">${q.concepts.split(',').map(c => `<span class="tag-concept">${c.trim()}</span>`).join('')}</div>` : ''}
            ${q.comment ? `<div class="comment"><strong>備註:</strong> ${q.comment}</div>` : ''}
        </div>
    `).join('');
}

// Delete question
async function deleteQuestion(id) {
    if (confirm('確定要刪除此題目？')) {
        await window.storage.deleteQuestion(id);
        await refreshViews();
    }
}

// Filter questions based on current filters
function filterQuestionsList(questions) {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const examFilter = window.currentFilters?.exam || [];
    const yearFilter = window.currentFilters?.year || [];
    const qtypeFilter = window.currentFilters?.qtype || [];
    
    return questions.filter(q => {
        const matchesSearch = !searchTerm || 
            q.exam.toLowerCase().includes(searchTerm) ||
            q.section.toLowerCase().includes(searchTerm) ||
            q.qnumber.toLowerCase().includes(searchTerm) ||
            (q.topic && q.topic.toLowerCase().includes(searchTerm)) ||
            (q.publisher && q.publisher.toLowerCase().includes(searchTerm));
        
        const matchesExam = examFilter.length === 0 || examFilter.includes(q.exam);
        const matchesYear = yearFilter.length === 0 || yearFilter.includes(String(q.year));
        const matchesQtype = qtypeFilter.length === 0 || qtypeFilter.includes(q.qtype);
        
        return matchesSearch && matchesExam && matchesYear && matchesQtype;
    });
}