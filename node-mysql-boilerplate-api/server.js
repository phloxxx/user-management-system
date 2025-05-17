require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');
const path = require('path'); // Add this for path operations
const fs = require('fs'); // Add this for file system operations

app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://real-user-management-system.onrender.com'
  ], // Allow both local and deployed URLs
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

// api routes
app.use('/accounts', require('./accounts/account.controller'));
app.use('/departments', require('./departments/index'));
app.use('/employees', require('./employees/index'));
app.use('/workflows', require('./workflows/index'));
app.use('/requests', require('./requests/index'));  // Make sure this is added

// swagger docs route
app.use('/api-docs', require('./_helpers/swagger'));

// Serve static files from the Angular app if they exist
const angularDistPath = path.join(__dirname, '../angular-signup-verification-boilerplate/dist/angular-signup-verification-boilerplate');
const fallbackPath = path.join(__dirname, './public'); // Create a basic public folder for fallback

// Check if the Angular dist directory exists
if (fs.existsSync(angularDistPath)) {
  console.log('Angular dist folder found, serving frontend from there');
  app.use(express.static(angularDistPath));
  
  // Catch-all route for Angular client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(angularDistPath, 'index.html'));
  });
} else {
  console.log('Angular dist folder not found, serving API only or from fallback location');
  
  // Make sure we have a public directory with a basic index.html
  if (!fs.existsSync(fallbackPath)) {
    fs.mkdirSync(fallbackPath, { recursive: true });
    
    const basicHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>User Management API</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; }
            .container { max-width: 800px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>User Management API</h1>
            <p>The API is running. Frontend is not available in this deployment.</p>
            <p>API endpoints are available at:</p>
            <ul>
              <li><a href="/accounts">/accounts</a></li>
              <li><a href="/departments">/departments</a></li>
              <li><a href="/employees">/employees</a></li>
              <li><a href="/workflows">/workflows</a></li>
              <li><a href="/requests">/requests</a></li>
              <li><a href="/api-docs">/api-docs</a> (Swagger Documentation)</li>
            </ul>
          </div>
        </body>
      </html>
    `;
    
    fs.writeFileSync(path.join(fallbackPath, 'index.html'), basicHtml);
  }
  
  app.use(express.static(fallbackPath));
  
  // Fallback route for the API-only version
  app.get('/', (req, res) => {
    res.sendFile(path.join(fallbackPath, 'index.html'));
  });
}

// global error handler
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

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));