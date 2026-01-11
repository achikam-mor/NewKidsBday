const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
const path = require('path');
const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://enchanting-trifle-01bc26.netlify.app' 
    : `http://localhost:${PORT}`;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
app.use(cors({
    origin: BASE_URL,
    methods: ['GET', 'POST'],
    credentials: true
}));

// Gmail transporter setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'achikamor@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Twilio setup (using environment variables)
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID, 
    process.env.TWILIO_AUTH_TOKEN
);

// Send route
app.post('/send', (req, res) => {
    console.log('Received data:', req.body); // Log received data
    const { name, gifts, links, address } = req.body;

    const mailOptions = {
        from: 'achikamor@gmail.com',
        to: 'achikamor@gmail.com',
        subject: `Details for ${name}`,
        text: `Gifts: ${gifts}\nLinks: ${links}\nAddress: ${address}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email error:', error);
            return res.status(500).send(error.toString());
        }
        else{
            console.log('Email sent successfully:', info);
            res.status(200).send('Email sent successfully!');
        }
        
        // client.messages.create({
        //     body: `Details for ${name}\nGifts: ${gifts}\nLinks: ${links}\nAddress: ${address}`,
        //     from: 'whatsapp:+14155238886',
        //     to: 'whatsapp:+972502500413'
        // }).then(message => {
        //     res.status(200).send('Details sent successfully!');
        // }).catch(error => {
        //     res.status(500).send(error.toString());
        // });
    });
});

// Serve static files and handle client-side routing
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});