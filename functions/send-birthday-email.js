const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    // Parse the incoming data
    const { recipientEmail, recipientName, personName, age, timeDescription, gender, messageType } = JSON.parse(event.body);
    
    // Validate required fields
    if (!recipientEmail || !recipientName || !personName || !messageType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }
    
    // Gmail transporter setup (using environment variables)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'achikamor@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const genderPronoun = gender === 'f' ? 'her' : 'him';

    let subject, emailText;
    if (messageType === 'dayBefore') {
      subject = `Birthday Tomorrow: ${personName}!`;
      emailText = `Dear ${recipientName},

${personName} will have a birthday tomorrow (turns ${age}), don't forget to wish ${genderPronoun} 'Mazal Tov'.

Achikam automatic reminder`;
    } else {
      subject = `Birthday Reminder: ${personName}'s ${age} birthday`;
      emailText = `Dear ${recipientName},

${personName} is going to have a ${age} birthday in ${timeDescription}, please select a gift that costs around 600 Shekels to Achikam as soon as possible.

Please use this site https://enchanting-trifle-01bc26.netlify.app to send your presents.

Best regards,
Birthday Reminder System`;
    }

    const mailOptions = {
      from: 'achikamor@gmail.com',
      to: recipientEmail,
      subject,
      text: emailText
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Birthday reminder email sent successfully!',
        recipient: recipientEmail,
        person: personName
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
