const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load swagger.yaml using absolute path
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));

module.exports = {
    swaggerUi,
    swaggerDocument
};
