const nodemailer = require('nodemailer');
const config = require('config.json');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    console.log('=================== EMAIL SENDING START ===================');
    console.log('Starting email send process...');
    console.log('Email details:', { to, subject, from });
    console.log('SMTP Configuration:', {
        host: config.smtpOptions.host,
        port: config.smtpOptions.port,
        auth: {
            user: config.smtpOptions.auth.user
            // password omitted for security
        }
    });
    
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
        
        // For Ethereal Email specifically
        if (config.smtpOptions.host === 'smtp.ethereal.email') {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('===============================================');
            console.log('ETHEREAL EMAIL PREVIEW URL:', previewUrl);
            console.log('===============================================');
        }
        
        return info;
    } catch (error) {
        console.error('=================== EMAIL SENDING ERROR ===================');
        console.error('Email sending failed with error:', error.message);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        });
        console.error('Stack trace:', error.stack);
        console.error('====================================================');
        throw error;
    } finally {
        console.log('=================== EMAIL SENDING END ===================');
    }
}