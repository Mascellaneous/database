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