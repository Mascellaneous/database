// Dropdown toggle
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    
    // Close other dropdowns
    allDropdowns.forEach(d => {
        if (d.id !== dropdownId) {
            d.classList.remove('active');
        }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('active');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown-filter')) {
        document.querySelectorAll('.dropdown-content').forEach(d => {
            d.classList.remove('active');
        });
    }
});

// Tri-state filter toggle
function toggleTriState(element) {
    const filter = element.dataset.filter;
    const value = element.dataset.value;
    
    if (!window.triStateFilters[filter]) {
        window.triStateFilters[filter] = {};
    }
    
    const currentState = window.triStateFilters[filter][value];
    
    if (!currentState) {
        element.classList.add('checked');
        window.triStateFilters[filter][value] = 'checked';
    } else if (currentState === 'checked') {
        element.classList.remove('checked');
        element.classList.add('excluded');
        window.triStateFilters[filter][value] = 'excluded';
    } else {
        element.classList.remove('excluded');
        delete window.triStateFilters[filter][value];
    }
    
    filterQuestions();
}

function clearFilters() {
    document.getElementById('search').value = '';
    document.getElementById('exam-filter').value = '';
    document.getElementById('year-filter').value = '';
    document.getElementById('qtype-filter').value = '';
    
    // Reset tri-state filters
    document.querySelectorAll('.tri-state-checkbox').forEach(el => {
        el.classList.remove('checked', 'excluded');
    });
    window.triStateFilters = { curriculum: {}, feature: {} };

    // Reset percentage filter
    clearPercentageFilter();    

    window.paginationState.questions.page = 1;
    renderQuestions();
}

async function filterQuestions() {
    window.paginationState.questions.page = 1;
    await renderQuestions();
}

// Percentage filter state
window.percentageFilter = {
    min: 0,
    max: 100,
    active: false
};

function updateDualRange() {
    const minSlider = document.getElementById('min-percentage');
    const maxSlider = document.getElementById('max-percentage');
    const minDisplay = document.getElementById('min-percentage-display');
    const maxDisplay = document.getElementById('max-percentage-display');
    const minLabel = document.getElementById('min-label');
    const maxLabel = document.getElementById('max-label');
    const rangeFill = document.getElementById('range-fill');
    
    let minVal = parseInt(minSlider.value);
    let maxVal = parseInt(maxSlider.value);
    
    // Ensure min doesn't exceed max
    if (minVal > maxVal) {
        minVal = maxVal;
        minSlider.value = minVal;
    }
    
    // Update displays
    minDisplay.textContent = minVal;
    maxDisplay.textContent = maxVal;
    minLabel.textContent = minVal;
    maxLabel.textContent = maxVal;
    
    // Update the filled range visualization
    const percentMin = (minVal / 100) * 100;
    const percentMax = (maxVal / 100) * 100;
    
    rangeFill.style.left = percentMin + '%';
    rangeFill.style.width = (percentMax - percentMin) + '%';
    
    // Update filter state
    window.percentageFilter.min = minVal;
    window.percentageFilter.max = maxVal;
}

function applyPercentageFilter() {
    const minVal = parseInt(document.getElementById('min-percentage').value);
    const maxVal = parseInt(document.getElementById('max-percentage').value);
    
    // Only activate filter if range is not 0-100 (i.e., user has changed it)
    window.percentageFilter = {
        min: minVal,
        max: maxVal,
        active: (minVal > 0 || maxVal < 100)
    };
    
    if (window.percentageFilter.active) {
        console.log(`📊 Filtering by 答對率: ${minVal}% - ${minVal}%`);
    }
    
    // Trigger filter update
    filterQuestions();
}

function clearPercentageFilter() {
    const minSlider = document.getElementById('min-percentage');
    const maxSlider = document.getElementById('max-percentage');
    
    minSlider.value = 0;
    maxSlider.value = 100;
    
    window.percentageFilter = {
        min: 0,
        max: 100,
        active: false
    };
    
    updateDualRange();
    
    console.log('🗑️ Cleared percentage filter');
    
    // Trigger filter update
    filterQuestions();
}