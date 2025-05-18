const nodemailer = require('nodemailer');
const config = require('config.json');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    console.log('Starting email send process...');
    console.log('Email details:', { to, subject, from });
    console.log('SMTP Configuration:', JSON.stringify(config.smtpOptions, null, 2));
    
    try {
        console.log('Creating transport...');
        const transporter = nodemailer.createTransport(config.smtpOptions);
        
        console.log('Verifying transport...');
        await transporter.verify();
        console.log('Transport verified successfully');
        
        console.log('Sending email...');
        const info = await transporter.sendMail({ from, to, subject, html });
        
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        
        return info;
    } catch (error) {
        console.error('Email sending failed with error:', error);
        console.error('Error stack:', error.stack);
        throw error;
    }
}