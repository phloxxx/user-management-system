const nodemailer = require('nodemailer');
// Replace config import with proper path
const config = require('../config.json');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    try {
        // Create Ethereal test account
        const testAccount = await nodemailer.createTestAccount();
        
        // Create transporter with Ethereal credentials
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        // Send mail and get info
        const info = await transporter.sendMail({ from, to, subject, html });
        
        // Log the preview URL
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        
        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info)
        };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
}