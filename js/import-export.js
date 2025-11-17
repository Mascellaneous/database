// Import/Export
async function exportData() {
    const data = await storage.exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `econ-questions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

async function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const text = await file.text();
        const count = await storage.importDatabase(text);
        alert(`成功匯入 ${count} 題`);
        await refreshViews();
    };
    
    input.click();
}

async function clearDatabase() {
    if (confirm('確定要清除所有資料？此操作無法復原！')) {
        await storage.clear();
        await refreshViews();
        alert('資料庫已清空');
    }
}