const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  try {
    // Parse the incoming data
    const { name, birthdate, gifts, links, selectedChild } = JSON.parse(event.body);
    
    // Gmail transporter setup (using environment variables)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'achikamor@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Format the email body
    const emailBody = `
New Gift Registration

From: ${name}
Birthdate: ${birthdate}
Child: ${selectedChild}

Gift Ideas:
${gifts || 'None provided'}

Links:
${links || 'None provided'}
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'achikamor@gmail.com',
      to: 'achikamor@gmail.com',
      subject: `Gift Registration for ${selectedChild} from ${name}`,
      text: emailBody
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Email sent successfully!', messageId: info.messageId })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message, details: error.toString() })
    };
  }
};