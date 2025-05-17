const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const fs = require('fs');
const path = require('path');

// Path to the swagger.yaml file
const swaggerPath = path.join(__dirname, '..', 'swagger.yaml');

// Function to set up Swagger routes
function setupSwagger(app) {
    try {
        // Check if the file exists before attempting to load it
        if (fs.existsSync(swaggerPath)) {
            const swaggerDocument = YAML.load(swaggerPath);
            
            // Setup Swagger UI
            app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
            
            // Redirect root to API docs
            app.get('/docs', (req, res) => {
                res.redirect('/api-docs');
            });
            
            console.log('✅ Swagger documentation initialized at /api-docs');
        } else {
            console.warn('⚠️ swagger.yaml file not found at ' + swaggerPath + '. API documentation will not be available.');
            
            // Set up a simple message for the API docs route
            app.get('/api-docs', (req, res) => {
                res.send('API documentation is not available. swagger.yaml file is missing.');
            });
            
            app.get('/docs', (req, res) => {
                res.send('API documentation is not available. swagger.yaml file is missing.');
            });
        }
    } catch (error) {
        console.error('❌ Error initializing Swagger documentation:', error);
        
        // Set up an error message for the API docs route
        app.get('/api-docs', (req, res) => {
            res.status(500).send('Error initializing API documentation.');
        });
        
        app.get('/docs', (req, res) => {
            res.status(500).send('Error initializing API documentation.');
        });
    }
}

module.exports = setupSwagger;