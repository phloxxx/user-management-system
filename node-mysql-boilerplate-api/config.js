module.exports = {
        database: {
        host: process.env.DB_HOST || '153.92.15.31',  // Update this with your actual Render MySQL host
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'u875409848_ocliasa',
        password: process.env.DB_PASSWORD || '9T2Z5$3UKkgSYzE',
        database: process.env.DB_NAME || 'u875409848_ocliasa',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: {
            rejectUnauthorized: false
        }
    },
    secret: process.env.JWT_SECRET || "THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING",
    emailFrom: process.env.EMAIL_FROM || "info@node-mysql-signup-verification-api.com",
    smtpOptions: {
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: {
            user: process.env.SMTP_USER || "merlin.koss@ethereal.email",
            pass: process.env.SMTP_PASS || "SB5ZhzfXyVgF5Hvk3F"
        }
    }
};