class IndexedDBStorage {
    constructor() {
        this.dbName = 'EconQuestionsDB';
        this.version = 2;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains('questions')) {
                    const questionStore = db.createObjectStore('questions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    questionStore.createIndex('exam', 'exam', { unique: false });
                    questionStore.createIndex('year', 'year', { unique: false });
                    questionStore.createIndex('qtype', 'qtype', { unique: false });
                }

                if (!db.objectStoreNames.contains('publishers')) {
                    db.createObjectStore('publishers', { keyPath: 'name' });
                }
                if (!db.objectStoreNames.contains('topics')) {
                    db.createObjectStore('topics', { keyPath: 'name' });
                }
                if (!db.objectStoreNames.contains('concepts')) {
                    db.createObjectStore('concepts', { keyPath: 'name' });
                }
                if (!db.objectStoreNames.contains('patterns')) {
                    db.createObjectStore('patterns', { keyPath: 'name' });
                }
            };
        });
    }

    async addQuestion(question) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['questions'], 'readwrite');
            const store = transaction.objectStore('questions');
            const request = store.add(question);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getQuestions(filters = {}) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['questions'], 'readonly');
            const store = transaction.objectStore('questions');
            const request = store.getAll();

            request.onsuccess = () => {
                let questions = request.result;
                
                // Apply filters
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    questions = questions.filter(q => {
                        return (
                            (q.id && String(q.id).toLowerCase().includes(searchLower)) ||
                            (q.examination && q.examination.toLowerCase().includes(searchLower)) ||
                            (q.section && q.section.toLowerCase().includes(searchLower)) ||
                            (q.questionNumber && q.questionNumber.toLowerCase().includes(searchLower)) ||
                            (q.questionTextChi && q.questionTextChi.toLowerCase().includes(searchLower)) ||
                            (q.questionTextEng && q.questionTextEng.toLowerCase().includes(searchLower)) ||
                            (q.publisher && q.publisher.toLowerCase().includes(searchLower))
                        );
                    });
                }
                
                if (filters.examination) {
                    questions = questions.filter(q => q.examination === filters.examination);
                }
                
                if (filters.year) {
                    questions = questions.filter(q => String(q.year) === String(filters.year));
                }
                
                if (filters.questionType) {
                    questions = questions.filter(q => q.questionType === filters.questionType);
                }
                
                // Tri-state filters
                if (filters.triState) {
                    // Curriculum filters
                    if (filters.triState.curriculum) {
                        const checkedCurr = Object.keys(filters.triState.curriculum).filter(k => filters.triState.curriculum[k] === 'checked');
                        const excludedCurr = Object.keys(filters.triState.curriculum).filter(k => filters.triState.curriculum[k] === 'excluded');
                        
                        if (checkedCurr.length > 0) {
                            questions = questions.filter(q => {
                                if (!q.curriculumClassification || !Array.isArray(q.curriculumClassification)) return false;
                                return checkedCurr.some(curr => q.curriculumClassification.includes(curr));
                            });
                        }
                        
                        if (excludedCurr.length > 0) {
                            questions = questions.filter(q => {
                                if (!q.curriculumClassification || !Array.isArray(q.curriculumClassification)) return true;
                                return !excludedCurr.some(curr => q.curriculumClassification.includes(curr));
                            });
                        }
                    }
                    
                    // Feature filters (graph, table, multiple selection)
                    if (filters.triState.feature) {
                        const features = filters.triState.feature;
                        
                        if (features['graph'] === 'checked') {
                            questions = questions.filter(q => q.graphType && q.graphType !== '-');
                        } else if (features['graph'] === 'excluded') {
                            questions = questions.filter(q => !q.graphType || q.graphType === '-');
                        }
                        
                        if (features['table'] === 'checked') {
                            questions = questions.filter(q => q.tableType && q.tableType !== '-');
                        } else if (features['table'] === 'excluded') {
                            questions = questions.filter(q => !q.tableType || q.tableType === '-');
                        }
                        
                        if (features['multiple'] === 'checked') {
                            questions = questions.filter(q => q.multipleSelectionType && q.multipleSelectionType !== '-');
                        } else if (features['multiple'] === 'excluded') {
                            questions = questions.filter(q => !q.multipleSelectionType || q.multipleSelectionType === '-');
                        }
                    }
                }
                
                resolve(questions);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteQuestion(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['questions'], 'readwrite');
            const store = transaction.objectStore('questions');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async updateMetadata(storeName, name, comment) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ name, comment: comment || '' });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getMetadata(storeName, name) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(name);

            request.onsuccess = () => resolve(request.result || { name, comment: '' });
            request.onerror = () => reject(request.error);
        });
    }

    async getAllMetadata(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clear() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['questions', 'publishers', 'topics', 'concepts', 'patterns'], 'readwrite');
            
            const stores = ['questions', 'publishers', 'topics', 'concepts', 'patterns'];
            let completed = 0;
            
            stores.forEach(storeName => {
                const request = transaction.objectStore(storeName).clear();
                request.onsuccess = () => {
                    completed++;
                    if (completed === stores.length) resolve();
                };
                request.onerror = () => reject(request.error);
            });
        });
    }
}

class GoogleSheetsSync {
    constructor(webAppUrl) {
        this.webAppUrl = webAppUrl;
        this.lastSyncTime = null;
        this.SEPARATOR = String.fromCharCode(30); // Field separator
        this.ROW_SEPARATOR = String.fromCharCode(31); // Row separator
        
        this.columnMappings = {
            'Publisher': 'publisher',
            'Exam': 'examination',
            'Year': 'year',
            'Paper': 'paper',
            'Section': 'section',
            'Question Number': 'questionNumber',
            'Unique ID': 'id',
            'Plain text (Chi)': 'questionTextChi',
            'Plain text (Eng)': 'questionTextEng',
            '多選類': 'multipleSelectionType',
            'Graph': 'graphType',
            'Table': 'tableType',
            'Answer': 'answer',
            '答對百分比 (%)': 'correctPercentage',
            '考試報告': 'markersReport',
            'Marks': 'marks',
            '課程分類': 'curriculumClassification',
            'Aristo Learning Focus分類 (以上載的文件為準)': 'chapterClassification',
            '涉及概念': 'concepts',
            'MC題型': 'patternTags',
            'MC選項設計': 'optionDesign',
            'Remarks': 'remarks'
        };
        
        this.requiredFields = ['examination', 'id'];
    }
    
    // Helper function to check if a value is valid (not empty, not just "-")
    isValidValue(value) {
        if (!value) return false;
        const trimmed = value.trim();
        return trimmed !== '' && trimmed !== '-';
    }
    
    async fetchData() {
        console.log('📡 Fetching from Apps Script:', this.webAppUrl);
        const response = await fetch(this.webAppUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: 無法讀取資料`);
        }
        
        const text = await response.text();
        
        if (text.startsWith('Error:')) {
            throw new Error(text);
        }
        
        return text;
    }
    
    validateHeaders(headers) {
        const validation = {
            isValid: true,
            mappedFields: {},
            unmappedHeaders: [],
            missingRequired: [],
            warnings: [],
            rawHeaders: []
        };
        
        console.log('\n🔍 DEBUG: Raw headers from Google Sheets:');
        console.log('==========================================');
        
        headers.forEach((header, index) => {
            const trimmed = header.trim();
            
            console.log(`Column ${index + 1}: "${trimmed}"`);
            
            validation.rawHeaders.push(trimmed);
            
            const dbField = this.columnMappings[trimmed];
            
            if (dbField) {
                if (validation.mappedFields[dbField]) {
                    console.warn(`⚠️ WARNING: Duplicate mapping for field "${dbField}"!`);
                    console.warn(`  Previously mapped from column ${validation.mappedFields[dbField].columnIndex + 1}: "${validation.mappedFields[dbField].headerName}"`);
                    console.warn(`  Now also found at column ${index + 1}: "${trimmed}"`);
                }
                
                validation.mappedFields[dbField] = {
                    columnIndex: index,
                    headerName: trimmed,
                    dbField: dbField
                };
                console.log(`  ✅ Mapped to: ${dbField}`);
            } else if (trimmed) {
                validation.unmappedHeaders.push({
                    columnIndex: index,
                    headerName: trimmed
                });
                console.log(`  ❌ Not mapped (will be ignored)`);
            }
        });
        
        console.log('==========================================\n');
        
        this.requiredFields.forEach(field => {
            if (!validation.mappedFields[field]) {
                validation.missingRequired.push(field);
                validation.isValid = false;
            }
        });
        
        if (validation.unmappedHeaders.length > 0) {
            validation.warnings.push(
                `以下欄位無法識別，將被忽略: ${validation.unmappedHeaders.map(h => h.headerName).join(', ')}`
            );
        }
        
        return validation;
    }
    
    parseLine(line) {
        // Split by field separator and restore newlines
        return line.split(this.SEPARATOR).map(v => {
            // Convert \\n back to actual newlines
            return v.replace(/\\n/g, '\n');
        });
    }
    
    async parseAndValidate() {
        const textData = await this.fetchData();
        
        // Split by ROW_SEPARATOR instead of newline
        const lines = textData.split(this.ROW_SEPARATOR).filter(line => line.trim());
        
        if (lines.length < 1) {
            throw new Error('資料為空');
        }
        
        const headers = this.parseLine(lines[0]);
        const validation = this.validateHeaders(headers);
        
        this.displayValidation(validation);
        
        if (!validation.isValid) {
            throw new Error('欄位驗證失敗: 缺少必要欄位 ' + validation.missingRequired.join(', '));
        }
        
        const questions = [];
        let skippedCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = this.parseLine(lines[i]);
            const question = {
                dateAdded: new Date().toISOString(),
                dateModified: new Date().toISOString()
            };
            
            Object.entries(validation.mappedFields).forEach(([dbField, info]) => {
                let value = values[info.columnIndex] || '';
                
                // Don't trim yet - we need to preserve formatting for multi-line fields
                if (!value) return;
                
                switch (dbField) {
                    case 'year':                        
                    case 'marks':
                    case 'correctPercentage':
                        const trimmedNum = value.trim();
                        const num = parseFloat(trimmedNum);
                        if (!isNaN(num)) {
                            question[dbField] = num;
                        }
                        break;
                        
                    case 'curriculumClassification':
                    case 'chapterClassification':
                    case 'concepts':
                    case 'patternTags':
                        // Trim before splitting for array fields
                        question[dbField] = value.trim().split(',').map(s => s.trim()).filter(s => s);
                        break;
                        
                    case 'multipleSelectionType':
                    case 'graphType':
                    case 'tableType':
                        question[dbField] = value.trim() || '-';
                        break;
                    
                    // Fields that may contain multi-line text - preserve newlines
                    case 'questionTextChi':
                    case 'questionTextEng':
                    case 'markersReport':
                    case 'remarks':
                        // Only trim leading/trailing whitespace from the entire text
                        // but preserve internal formatting and newlines
                        question[dbField] = value.trim();
                        break;
                        
                    default:
                        // For all other fields, trim normally
                        question[dbField] = value.trim();
                }
            });
            
            // STRICT validation: Check required fields have VALID values (not empty, not "-")
            if (this.isValidValue(question.examination) && this.isValidValue(question.id)) {
                questions.push(question);
            } else {
                skippedCount++;
                console.log(`⚠️ Row ${i + 1} skipped - missing required fields (examination: "${question.examination || ''}", id: "${question.id || ''}")`);
            }
        }
        
        if (skippedCount > 0) {
            console.log(`\n⚠️ Total rows skipped: ${skippedCount}`);
        }
        
        return { questions, validation };
    }
    
    displayValidation(validation) {
        console.log('\n========================================');
        console.log('📊 Google Sheets 欄位驗證結果');
        console.log('========================================\n');
        
        console.log('✅ 成功映射的欄位:');
        console.log('-------------------');
        Object.entries(validation.mappedFields)
            .sort((a, b) => a[1].columnIndex - b[1].columnIndex)
            .forEach(([dbField, info]) => {
                console.log(`  第 ${info.columnIndex + 1} 欄: "${info.headerName}" → 資料庫欄位: "${dbField}"`);
            });
        
        if (validation.unmappedHeaders.length > 0) {
            console.log('\n⚠️  無法識別的欄位（將被忽略）:');
            console.log('--------------------------------');
            validation.unmappedHeaders.forEach(h => {
                console.log(`  第 ${h.columnIndex + 1} 欄: "${h.headerName}"`);
            });
        }
        
        if (validation.missingRequired.length > 0) {
            console.log('\n❌ 缺少必要欄位:');
            console.log('----------------');
            validation.missingRequired.forEach(field => {
                console.log(`  • ${field}`);
            });
        }
        
        if (validation.warnings.length > 0) {
            console.log('\n⚠️  警告:');
            console.log('--------');
            validation.warnings.forEach(warning => {
                console.log(`  • ${warning}`);
            });
        }
        
        console.log('\n========================================\n');
    }
    
    async syncOnLoad() {
        try {
            console.log('🔄 開始同步 Google Sheets...');
            
            const { questions, validation } = await this.parseAndValidate();
            
            if (questions.length === 0) {
                console.log('⚠️  沒有找到有效的題目資料');
                return { success: false, count: 0, validation };
            }
            
            await window.storage.clear();
            
            let imported = 0;
            for (const question of questions) {
                try {
                    await window.storage.addQuestion(question);
                    imported++;
                } catch (error) {
                    console.error('Failed to import question:', question, error);
                }
            }
            
            this.lastSyncTime = new Date();
            localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
            
            console.log(`✅ 同步完成！成功匯入 ${imported} 題`);
            
            return { 
                success: true, 
                count: imported, 
                validation,
                lastSyncTime: this.lastSyncTime 
            };
            
        } catch (error) {
            console.error('❌ 同步失敗:', error);
            throw error;
        }
    }
    
    updateSyncStatus(result) {
        const statusElement = document.getElementById('sync-status');
        if (!statusElement) return;
        
        if (result.success) {
            statusElement.innerHTML = `
                ✅ 最後同步: ${new Date().toLocaleTimeString('zh-TW')} (${result.count} 題)
            `;
            statusElement.style.color = '#ffffff';
        } else {
            statusElement.innerHTML = `❌ 同步失敗: ${result.error || '未知錯誤'}`;
            statusElement.style.color = '#e74c3c';
        }
    }
}

window.googleSheetsSync = null;