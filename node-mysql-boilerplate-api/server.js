require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const errorHandler = require('./_middleware/error-handler');

// CORS config
app.use(cors({
  origin: 'https://durano-final-project-system.onrender.com',
  credentials: true
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// 👉 Serve Angular static files from sibling folder
const clientDist = path.join(__dirname,
  '..',
  'angular-signup-verification-boilerplate',
  'dist',
  'angular-signup-verification-boilerplate'
);
app.use(express.static(clientDist));

// Logging (optional)
app.use((req, res, next) => {
  console.log('API Request:', req.method, req.path);
  next();
});

// API routes
app.use('/accounts', require('./accounts/account.controller'));
app.use('/departments', require('./departments/index'));
app.use('/employees', require('./employees/index'));
app.use('/workflows', require('./workflows/index'));
app.use('/requests', require('./requests/index'));
app.use('/api-docs', require('./_helpers/swagger'));

// 👉 Catch-all: serve Angular index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Global error handler
app.use(errorHandler);

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Server listening on port ' + port));