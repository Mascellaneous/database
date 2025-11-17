// Statistics functions
const CURRICULUM_NAMES = {
    'A': 'A: 基本經濟概念',
    'B': 'B: 廠商與生產',
    'C': 'C: 市場與價格',
    'D': 'D: 競爭與市場結構',
    'E': 'E: 效率、公平和政府的角色',
    'F': 'F: 經濟表現的量度',
    'G': 'G: 國民收入決定及價格水平',
    'H': 'H: 貨幣與銀行',
    'I': 'I: 宏觀經濟問題和政府',
    'J': 'J: 國際貿易和金融',
    'E1': 'E1: 選修單元一',
    'E2': 'E2: 選修單元二'
};

async function renderPublishers() {
    const questions = await window.storage.getQuestions();
    const stats = {};
    
    questions.forEach(q => {
        const publisher = q.publisher || 'Unknown';
        if (!stats[publisher]) {
            stats[publisher] = { total: 0, mc: 0, text: 0 };
        }
        stats[publisher].total++;
        if (q.questionType === 'MC') stats[publisher].mc++;
        if (q.questionType === 'Text') stats[publisher].text++;
    });
    
    const grid = document.getElementById('publishers-grid');
    grid.innerHTML = Object.entries(stats)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([publisher, data]) => `
            <div class="stat-card">
                <h3>${publisher}</h3>
                <div class="stat-details">
                    <div>總題目: ${data.total}</div>
                    <div>MC: ${data.mc}</div>
                    <div>文字題: ${data.text}</div>
                </div>
            </div>
        `).join('');
}

async function renderTopics() {
    const questions = await window.storage.getQuestions();
    const stats = {};
    
    questions.forEach(q => {
        if (q.curriculumClassification && Array.isArray(q.curriculumClassification)) {
            q.curriculumClassification.forEach(topic => {
                if (!stats[topic]) {
                    stats[topic] = { total: 0, mc: 0, text: 0 };
                }
                stats[topic].total++;
                if (q.questionType === 'MC') stats[topic].mc++;
                if (q.questionType === 'Text') stats[topic].text++;
            });
        }
    });
    
    const grid = document.getElementById('topics-grid');
    grid.innerHTML = Object.entries(stats)
        .sort((a, b) => {
            // Sort by curriculum order
            const order = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'E1', 'E2'];
            return order.indexOf(a[0]) - order.indexOf(b[0]);
        })
        .map(([topic, data]) => `
            <div class="stat-card">
                <h3>${CURRICULUM_NAMES[topic] || topic}</h3>
                <div class="stat-details">
                    <div>總題目: ${data.total}</div>
                    <div>MC: ${data.mc}</div>
                    <div>文字題: ${data.text}</div>
                </div>
            </div>
        `).join('');
}

async function renderConcepts() {
    const questions = await window.storage.getQuestions();
    const stats = {};
    
    questions.forEach(q => {
        if (q.concepts && Array.isArray(q.concepts)) {
            q.concepts.forEach(concept => {
                if (!stats[concept]) {
                    stats[concept] = { total: 0, mc: 0, text: 0 };
                }
                stats[concept].total++;
                if (q.questionType === 'MC') stats[concept].mc++;
                if (q.questionType === 'Text') stats[concept].text++;
            });
        }
    });
    
    const grid = document.getElementById('concepts-grid');
    grid.innerHTML = Object.entries(stats)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([concept, data]) => `
            <div class="stat-card">
                <h3>${concept}</h3>
                <div class="stat-details">
                    <div>總題目: ${data.total}</div>
                    <div>MC: ${data.mc}</div>
                    <div>文字題: ${data.text}</div>
                </div>
            </div>
        `).join('');
}

async function renderPatterns() {
    const questions = await window.storage.getQuestions();
    const stats = {};
    
    questions.forEach(q => {
        if (q.patternTags && Array.isArray(q.patternTags)) {
            q.patternTags.forEach(pattern => {
                if (!stats[pattern]) {
                    stats[pattern] = { total: 0, mc: 0, text: 0 };
                }
                stats[pattern].total++;
                if (q.questionType === 'MC') stats[pattern].mc++;
                if (q.questionType === 'Text') stats[pattern].text++;
            });
        }
    });
    
    const grid = document.getElementById('patterns-grid');
    grid.innerHTML = Object.entries(stats)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([pattern, data]) => `
            <div class="stat-card">
                <h3>${pattern}</h3>
                <div class="stat-details">
                    <div>總題目: ${data.total}</div>
                    <div>MC: ${data.mc}</div>
                    <div>文字題: ${data.text}</div>
                </div>
            </div>
        `).join('');
}

async function refreshStatistics() {
    await renderPublishers();
    await renderTopics();
    await renderConcepts();
    await renderPatterns();
}