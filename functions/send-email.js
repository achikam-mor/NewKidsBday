const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    // Parse the incoming data
    const { name, gifts, links, address } = JSON.parse(event.body);
    
    // Gmail transporter setup (using environment variables)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'achikamor@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const mailOptions = {
      from: 'achikamor@gmail.com',
      to: 'achikamor@gmail.com',
      subject: `Details for ${name}`,
      text: `Gifts: ${gifts}\nLinks: ${links}\nAddress: ${address}`
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!' })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};