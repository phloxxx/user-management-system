const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load swagger.yaml using absolute path
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));

// Create router for swagger docs
const router = express.Router();
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

module.exports = router;
