const nodemailer = require('nodemailer');
const config = require('config.json');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    console.log('Attempting to send email:', {
        to,
        from,
        subject,
        smtpConfig: {
            host: config.smtpOptions.host,
            port: config.smtpOptions.port,
            auth: {
                user: config.smtpOptions.auth.user
            }
        }
    });

    try {
        const transporter = nodemailer.createTransport(config.smtpOptions);
        const info = await transporter.sendMail({ from, to, subject, html });
        console.log('Email sent successfully:', info);
        
        // Log the Ethereal URL where the email can be viewed
        if (config.smtpOptions.host === 'smtp.ethereal.email') {
            console.log('Ethereal Mail URL:', nodemailer.getTestMessageUrl(info));
        }
        
        return info;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}