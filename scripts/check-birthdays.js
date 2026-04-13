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

// Calculate date X days before a given date (handles year boundaries)
function getDateDaysBefore(day, month, year, daysBefore) {
  // Create a date object for the birthday in the current/next year
  const birthdayDate = new Date(year, month - 1, day);
  
  // Subtract the days
  const reminderDate = new Date(birthdayDate);
  reminderDate.setDate(birthdayDate.getDate() - daysBefore);
  
  return { 
    day: reminderDate.getDate(), 
    month: reminderDate.getMonth() + 1,
    year: reminderDate.getFullYear()
  };
}

// Check if today matches a specific number of days before birthday
function shouldSendReminderDays(birthday, daysBefore) {
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();
  
  // Parse birthday (format: "DD.MM")
  const [day, month] = birthday.split('.').map(num => parseInt(num, 10));
  
  // Check for this year's birthday
  let reminderDate = getDateDaysBefore(day, month, todayYear, daysBefore);
  if (todayDay === reminderDate.day && todayMonth === reminderDate.month && todayYear === reminderDate.year) {
    return true;
  }
  
  // Check for next year's birthday (in case birthday already passed this year)
  reminderDate = getDateDaysBefore(day, month, todayYear + 1, daysBefore);
  if (todayDay === reminderDate.day && todayMonth === reminderDate.month && todayYear === reminderDate.year) {
    return true;
  }
  
  return false;
}

// Get time description for reminder
function getTimeDescription(daysBefore) {
  if (daysBefore === 60) return '2 months';
  if (daysBefore === 30) return '1 month';
  if (daysBefore === 21) return '3 weeks';
  if (daysBefore === 14) return '2 weeks';
  return `${daysBefore} days`;
}

// Calculate age for upcoming birthday
function calculateUpcomingAge(birthYear) {
  const today = new Date();
  const currentYear = today.getFullYear();
  return currentYear - birthYear;
}

// Send email via Netlify function
async function sendBirthdayEmail(recipientEmail, recipientName, personName, age, timeDescription, gender = 'm', messageType = 'reminder') {
  try {
    const response = await axios.post(NETLIFY_FUNCTION_URL, {
      recipientEmail,
      recipientName,
      personName,
      age,
      timeDescription,
      gender,
      messageType
    });
    
    console.log(`✓ Email sent to ${recipientName} (${recipientEmail}) for ${personName}'s birthday`);
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
    const { name, birthday, birthYear, gender, recipients: recipientEmails } = birthdayEntry;
    
    // Check for 2 months (60 days), 1 month (30 days), 3 weeks (21 days), and 2 weeks (14 days) before
    for (const daysBefore of [60, 30, 21, 14]) {
      if (shouldSendReminderDays(birthday, daysBefore)) {
        const age = calculateUpcomingAge(birthYear);
        const timeDescription = getTimeDescription(daysBefore);
        
        console.log(`🎂 Reminder match: ${name}'s ${age} birthday (${birthday}) - ${timeDescription} before`);
        
        // Send to all recipients in the group
        const allRecipients = [...recipientEmails, 'achikamor@gmail.com'];
        
        for (const recipientEmail of allRecipients) {
          const recipientName = recipients[recipientEmail] || recipientEmail;
          
          try {
            await sendBirthdayEmail(recipientEmail, recipientName, name, age, timeDescription, gender);
            emailsSent++;
          } catch (error) {
            console.error(`Failed to send email to ${recipientEmail}`);
          }
        }
        
        console.log('');
      }
    }

    // Check for 1 day before: send Mazal Tov reminder to ALL participants
    if (shouldSendReminderDays(birthday, 1)) {
      const age = calculateUpcomingAge(birthYear);
      console.log(`🎉 Tomorrow is ${name}'s birthday (turns ${age})! Sending Mazal Tov reminders to all...`);
      
      for (const [recipientEmail, recipientName] of Object.entries(recipients)) {
        try {
          await sendBirthdayEmail(recipientEmail, recipientName, name, age, null, gender, 'dayBefore');
          emailsSent++;
        } catch (error) {
          console.error(`Failed to send day-before email to ${recipientEmail}`);
        }
      }
      
      console.log('');
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
