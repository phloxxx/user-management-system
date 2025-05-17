const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Use path.join to create an absolute path to the swagger.yaml file
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = router;