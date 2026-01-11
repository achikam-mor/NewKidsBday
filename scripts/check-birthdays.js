const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Netlify function URL
const NETLIFY_FUNCTION_URL = 'https://enchanting-trifle-01bc26.netlify.app/.netlify/functions/send-birthday-email';

// Load birthday data
function loadBirthdayData() {
  const dataPath = path.join(__dirname, '..', 'birthdays.json');
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

// Calculate date X months before a given date
function getDateMonthsBefore(day, month, monthsBefore) {
  let targetMonth = month - monthsBefore;
  let targetDay = day;
  
  // Handle year boundary
  if (targetMonth <= 0) {
    targetMonth += 12;
  }
  
  return { day: targetDay, month: targetMonth };
}

// Check if today matches the reminder date
function shouldSendReminder(birthday, monthsBefore) {
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Parse birthday (format: "DD.MM")
  const [day, month] = birthday.split('.').map(num => parseInt(num, 10));
  
  // Calculate the reminder date
  const reminderDate = getDateMonthsBefore(day, month, monthsBefore);
  
  return todayDay === reminderDate.day && todayMonth === reminderDate.month;
}

// Calculate age for upcoming birthday
function calculateUpcomingAge(birthYear) {
  const today = new Date();
  const currentYear = today.getFullYear();
  return currentYear - birthYear;
}

// Send email via Netlify function
async function sendBirthdayEmail(recipientEmail, recipientName, childName, age, monthsBefore) {
  try {
    const response = await axios.post(NETLIFY_FUNCTION_URL, {
      recipientEmail,
      recipientName,
      childName,
      age,
      monthsBefore
    });
    
    console.log(`✓ Email sent to ${recipientName} (${recipientEmail}) for ${childName}'s birthday`);
    return response.data;
  } catch (error) {
    console.error(`✗ Failed to send email to ${recipientEmail}:`, error.message);
    throw error;
  }
}

// Main function
async function checkBirthdays() {
  console.log('=== Birthday Checker Started ===');
  console.log(`Date: ${new Date().toLocaleDateString('en-GB')}`);
  console.log('');
  
  const data = loadBirthdayData();
  const { recipients, birthdays } = data;
  
  let emailsSent = 0;
  
  // Check each birthday
  for (const birthdayEntry of birthdays) {
    const { name, birthday, birthYear, recipients: recipientEmails } = birthdayEntry;
    
    // Check for 1 month and 2 months before
    for (const monthsBefore of [1, 2]) {
      if (shouldSendReminder(birthday, monthsBefore)) {
        const age = calculateUpcomingAge(birthYear);
        
        console.log(`🎂 Reminder match: ${name}'s ${age} birthday (${birthday}) - ${monthsBefore} month(s) before`);
        
        // Send to all recipients in the group
        const allRecipients = [...recipientEmails, 'achikamor@gmail.com'];
        
        for (const recipientEmail of allRecipients) {
          const recipientName = recipients[recipientEmail] || recipientEmail;
          
          try {
            await sendBirthdayEmail(recipientEmail, recipientName, name, age, monthsBefore);
            emailsSent++;
          } catch (error) {
            console.error(`Failed to send email to ${recipientEmail}`);
          }
        }
        
        console.log('');
      }
    }
  }
  
  console.log('=== Birthday Checker Completed ===');
  console.log(`Total emails sent: ${emailsSent}`);
  
  if (emailsSent === 0) {
    console.log('No birthday reminders to send today.');
  }
}

// Run the checker
checkBirthdays().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
