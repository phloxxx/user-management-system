require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');
const path = require('path');
const fs = require('fs');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// Check if public directory exists
const publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
    console.error('Public directory not found at:', publicPath);
    fs.mkdirSync(publicPath, { recursive: true });
}

// Serve static files from public directory
app.use(express.static(publicPath));

// API routes
app.use('/api/accounts', require('./accounts/account.controller'));
app.use('/api/departments', require('./departments/index'));
app.use('/api/employees', require('./employees/index'));
app.use('/api/workflows', require('./workflows/index'));
app.use('/api/requests', require('./requests/index'));

// Serve index.html for all other routes
app.get('*', (req, res, next) => {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        next(new Error(`index.html not found at ${indexPath}`));
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: err.message,
        path: err.path,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server
const port = process.env.PORT || 10000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
    console.log('Public directory path:', publicPath);
});