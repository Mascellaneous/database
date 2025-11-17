// test.js - Automatic database testing

async function logFirstQuestion() {
  try {
    // Check if storage exists
    if (!window.storage) {
      console.error('⚠️ window.storage not initialized yet');
      return false;
    }
    
    // Get questions from storage
    const questions = await window.storage.getQuestions();
    
    if (!questions || questions.length === 0) {
      console.error('⚠️ No questions found in database');
      return false;
    }
    
    const firstQuestion = questions[0];
    
    console.log('========================================');
    console.log('✅ DATABASE LOADED SUCCESSFULLY');
    console.log('========================================');
    console.log('📊 Total questions in database:', questions.length);
    console.log('📋 Total fields per question:', Object.keys(firstQuestion).length);
    console.log('');
    console.log('=== FIRST QUESTION - ALL FIELDS ===');
    console.log('');
    
    // Log each field with its value
    Object.keys(firstQuestion).forEach((field, index) => {
      const value = firstQuestion[field];
      let displayValue;
      
      if (value === '') {
        displayValue = '(empty string)';
      } else if (value === null) {
        displayValue = '(null)';
      } else if (value === undefined) {
        displayValue = '(undefined)';
      } else if (Array.isArray(value)) {
        displayValue = `[${value.join(', ')}]`;
      } else {
        displayValue = value;
      }
      
      console.log(`${index + 1}. ${field}: ${displayValue}`);
    });
    
    console.log('');
    console.log('=== FULL OBJECT ===');
    console.log(firstQuestion);
    console.log('========================================');
    
    return true;
  } catch (error) {
    console.error('❌ Error logging first question:', error);
    return false;
  }
}

// Wait for the database to load and automatically log the first question
if (typeof window !== 'undefined') {
  let checkCount = 0;
  const maxChecks = 600; // 60 seconds (100ms * 600)
  
  const checkDatabase = setInterval(async () => {
    checkCount++;
    
    // Check if storage is initialized
    if (window.storage && window.storage.db) {
      try {
        const success = await logFirstQuestion();
        if (success) {
          clearInterval(checkDatabase);
        }
      } catch (error) {
        // Continue checking if there's an error
      }
    }
    
    // Log progress every 5 seconds
    if (checkCount % 50 === 0) {
      console.log(`🔍 Waiting for database... (${checkCount / 10} seconds elapsed)`);
    }
    
    // Stop after max checks
    if (checkCount >= maxChecks) {
      clearInterval(checkDatabase);
      console.error('⚠️ Database failed to load within 60 seconds.');
    }
  }, 100); // Check every 100ms
}