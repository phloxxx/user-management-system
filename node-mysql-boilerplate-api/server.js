require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');
const path = require('path');

// CORS configuration
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Log API requests
app.use((req, res, next) => {
    console.log(`API Request: ${JSON.stringify({
        method: req.method,
        path: req.path,
        ip: req.ip
    })}`);
    next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/accounts', require('./accounts/account.controller'));
app.use('/api/departments', require('./departments/index'));
app.use('/api/employees', require('./employees/index'));
app.use('/api/workflows', require('./workflows/index'));
app.use('/api/requests', require('./requests/index'));

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use(errorHandler);

// Start server
const port = process.env.PORT || 10000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});