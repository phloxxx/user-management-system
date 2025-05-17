require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');
const path = require('path');

// CORS configuration - updated to include both local and production URLs
app.use(cors({
  origin: ['http://localhost:4200', 'https://real-user-management-system.onrender.com'],
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Add debugging middleware before routes
app.use((req, res, next) => {
    // Log all API requests for debugging
    const requestInfo = {
        method: req.method,
        path: req.path,
        ip: req.ip
    };
    
    if (req.method === 'POST' || req.method === 'PUT') {
        requestInfo.body = req.body;
    }
    
    console.log('API Request:', JSON.stringify(requestInfo, null, 2));
    next();
});

// Add logging middleware to show request bodies
app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log(`[${req.method}] ${req.url} - Request body:`, JSON.stringify(req.body));
    }
    next();
});

// API routes
app.use('/accounts', require('./accounts/account.controller'));
app.use('/departments', require('./departments/index'));
app.use('/employees', require('./employees/index'));
app.use('/workflows', require('./workflows/index'));
app.use('/requests', require('./requests/index'));

// Swagger docs route
app.use('/api-docs', require('./_helpers/swagger'));

// Root path handler - redirect to login page
app.get('/', (req, res) => {
  res.redirect('/accounts/login');
});

// Handle login path
app.get('/accounts/login', (req, res) => {
  // If you're serving frontend files:
  // res.sendFile(path.join(__dirname, '../angular-signup-verification-boilerplate/dist/index.html'));
  
  // For API-only backend:
  res.json({ 
    message: 'Welcome to the User Management System API', 
    endpoints: {
      login: '/accounts/authenticate',
      register: '/accounts/register',
      documentation: '/api-docs'
    }
  });
});

// Serve static Angular files if they exist
// Uncomment if you have a production build of the Angular app available
// const angularBuildPath = path.join(__dirname, '../angular-signup-verification-boilerplate/dist');
// if (fs.existsSync(angularBuildPath)) {
//   app.use(express.static(angularBuildPath));
//   
//   // Catch-all route to serve the Angular app for client-side routing
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(angularBuildPath, 'index.html'));
//   });
// }

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler caught:', err);
    
    if (err.stack) {
        console.error('Error stack:', err.stack);
    }
    
    // Add specific handling for Sequelize errors
    if (err.name?.includes('Sequelize')) {
        console.error('Sequelize error details:', {
            name: err.name,
            message: err.message,
            sql: err.sql,
            params: err.parameters
        });
        
        // Return a more informative message for development
        const devMessage = process.env.NODE_ENV === 'development' 
            ? `SQL: ${err.sql || 'N/A'}, Message: ${err.message}` 
            : undefined;
            
        return res.status(400).json({ 
            message: 'Database operation failed',
            error: devMessage
        });
    }
    
    switch (true) {
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({ message: err });
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            return res.status(401).json({ message: 'Unauthorized' });
        case err.name === 'SequelizeValidationError':
            // database validation error
            return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
        case err.name === 'SequelizeUniqueConstraintError':
            // unique constraint error
            return res.status(400).json({ message: 'A record with this name already exists' });
        default:
            console.error('Unhandled error:', err);
            return res.status(500).json({ 
                message: 'Internal Server Error',
                error: process.env.NODE_ENV === 'development' ? (err.message || err) : undefined
            });
    }
});

// Start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));