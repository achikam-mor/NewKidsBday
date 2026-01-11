const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    // Parse the incoming data
    const { recipientEmail, recipientName, childName, age, monthsBefore } = JSON.parse(event.body);
    
    // Validate required fields
    if (!recipientEmail || !recipientName || !childName || !age || !monthsBefore) {
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
    
    const monthText = monthsBefore === 1 ? '1 month' : '2 months';
    
    const mailOptions = {
      from: 'achikamor@gmail.com',
      to: recipientEmail,
      subject: `Birthday Reminder: ${childName}'s ${age} birthday`,
      text: `Dear ${recipientName},

The child ${childName} is going to have a ${age} birthday in ${monthText}, please select a gift that costs around 600 Shekels to Achikam as soon as possible.

Please use this site https://enchanting-trifle-01bc26.netlify.app to send your presents.

Best regards,
Birthday Reminder System`
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Birthday reminder email sent successfully!',
        recipient: recipientEmail,
        child: childName
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
