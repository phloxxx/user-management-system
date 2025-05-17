const fs = require('fs');
const path = require('path');

// Ensure the dist directory exists
const distPath = path.join(__dirname, 'angular-signup-verification-boilerplate/dist/angular-signup-verification-boilerplate');

// Create a simple server.js for serving the Angular app
const serverContent = `
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(__dirname));

// Send all requests to index.html
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the app by listening on the default Render port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(\`Server started on port \${PORT}\`);
});
`;

// Write server.js to the dist directory
fs.writeFileSync(path.join(distPath, 'server.js'), serverContent);

// Create a package.json in the dist directory for Render
const packageJson = {
  "name": "user-management-system-frontend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.17.1"
  },
  "engines": {
    "node": "18.x"
  }
};

fs.writeFileSync(
  path.join(distPath, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

console.log('Deployment files created successfully!');