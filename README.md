# User Management System

A full-stack user management system with Angular frontend and Node.js backend.

## Features

- User registration and email verification
- User authentication and authorization
- Password reset functionality
- User profile management
- Secure API endpoints
- Modern Angular frontend
- RESTful Node.js backend

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- Angular CLI (v17 or higher)

## Project Structure

```
user-management-system/
├── angular-signup-verification-boilerplate/  # Frontend
├── node-mysql-boilerplate-api/              # Backend
├── package.json                             # Root package.json
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd user-management-system
```

2. Install dependencies:
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately
npm run install:frontend
npm run install:backend
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the values in `.env` with your configuration

4. Set up the database:
- Create a MySQL database
- Update the database configuration in `.env`

## Available Scripts

### Development
- `npm start` - Start both frontend and backend in development mode
- `npm run start:frontend` - Start frontend only
- `npm run start:backend` - Start backend only

### Building
- `npm run build` - Build both frontend and backend
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only

### Testing
- `npm test` - Run tests for both frontend and backend
- `npm run test:frontend` - Run frontend tests
- `npm run test:backend` - Run backend tests

### Linting
- `npm run lint` - Run linting for both frontend and backend
- `npm run lint:frontend` - Run frontend linting
- `npm run lint:backend` - Run backend linting

### Maintenance
- `npm run clean` - Remove all node_modules directories
- `npm run clean:install` - Clean and reinstall all dependencies

## Development

### Frontend
- Built with Angular 17
- Uses Angular Material for UI components
- Implements reactive forms
- Follows Angular best practices

### Backend
- Built with Node.js and Express
- Uses MySQL with Sequelize ORM
- Implements JWT authentication
- Follows REST API best practices

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Introduction
A full-stack application for managing user accounts with features like email sign-up, verification, authentication, role-based authorization, and CRUD operations.

## Usage
* Register a new account at */accounts/register*.
* Verify your email using the link sent to your inbox.
* Log in at */accounts/login*.

## Testing
### **Functional testing results:** [https://docs.google.com/document/d/1zkrHnNJTvbq-L289UgOpzY6RdiAnttoRgajw37rYZjw/edit?tab=t.0]

---
### **Security Testing Documentation**
#### 1. XSS (Cross-Site Scripting)
- **Status:** ❌ Vulnerable
- **Location:** `fake-backend.ts`
- **Risk Level:** High
- **Details:** Unsanitized HTML content rendering in alert messages
```typescript
alertService.info(`
    <h4>Email Already Registered</h4>
    <p>Your email <strong>${account.email}</strong> is already registered.</p>
`);
```
- **Recommendation:** Implement Angular's DomSanitizer
```typescript
// filepath: src/app/services/alert.service.ts
import { DomSanitizer, SecurityContext } from '@angular/platform-browser';

export class AlertService {
  constructor(private sanitizer: DomSanitizer) {}

  info(content: string): void {
    const sanitizedContent = this.sanitizer.sanitize(SecurityContext.HTML, content);
    // Display sanitized content
  }
}
```
- DomSanitizer strips potentially dangerous HTML/JavaScript
- Prevents execution of malicious scripts while preserving legitimate formatting

---
#### 2. CSRF Protection
- **Status:** ❌ Missing
- **Risk Level:** Critical
- **Impact:** Vulnerable to cross-site request forgery attacks
- **Recommendation:** Implement CSRF tokens using csurf middleware
```javascript
// filepath: src/server.js
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(csrf({ cookie: true }));

app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});
```
**Angular Integration**
```javascript
import { HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
  })
};
```
- Generates unique CSRF token per session
- Prevents cross-site request forgery attacks
- Attacker's site cannot access/replicate token

---
#### 3. Security Headers
- **Status:** ❌ Missing
- **Risk Level:** High
- **Details:** Basic security headers not configured
- **Recommendation:** Implement Helmet middleware
```javascript
// filepath: src/server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```
- Sets critical security headers
- Prevents various attack vectors including XSS and clickjacking
- Forces HTTPS connections
- Controls resource loading sources

---
#### 4. Input Validation
- **Status:** ⚠️ Partial Implementation
- **Risk Level:** Medium
- **Location:** `src/controllers/user.controller.ts`
- **Details:** Incomplete validation on user input
- **Recommendation:** Strengthen validation rules
```typescript
// filepath: src/validators/user.validator.ts
import * as Joi from 'joi';

export const userValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .trim()
    .lowercase(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
    .required(),
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
});
```
- Validates all input before processing
- Enforces strict data format rules
- Prevents injection attacks
- Provides clear error messages

---
#### 5. Rate Limiting
- **Status:** ❌ Missing
- **Risk Level:** High
- **Impact:** Vulnerable to brute force attacks
- **Recommendation:** Implement rate limiting for API endpoints
```javascript
// filepath: src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes'
});

app.use('/api/auth/login', loginLimiter);
```
- Tracks requests by IP address
- Blocks excessive attempts
- Prevents brute force attacks
- Different limits for different endpoints

---
#### 6. Password Policy
- **Status:** ⚠️ Weak
- **Location:** `src/services/auth.service.js`
- **Details:** Minimal password requirements
- **Recommendation:** Enhance password complexity rules
```javascript
// filepath: src/services/auth.service.js
const passwordSchema = Joi.string()
  .min(8)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*#?&]{8,}$/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
  });
```
- Enforces strong password requirements
- Requires mixed case, numbers, and special characters
- Minimum length of 8 characters
- Provides clear error messages

## Contributing
* **Durano, Jhanna Kris** : Responsible for managing the main branch, reviewing pull requests, and ensuring smooth integration.
Backend Developers (2 members):
* **Real, Rovic Steve**: Implement email sign-up, verification, and authentication.
* **Ocliasa, Niño Rollane**: Implement role-based authorization, forgot password/reset password, and CRUD operations.
Frontend Developers (2 members):
* **Durano, Jhanna Kris**: Implement email sign-up, verification, and authentication.
* **Arcana, Sean Joseph**: Implement profile management, admin dashboard, and fake backend.
Testers (2 members):
* **Real, Rovic Steve**:: Perform functional testing and validate user flows.
* **Ocliasa, Niño Rollane**: Perform security testing and validate edge cases.

## License
### MIT License

---
### **Best Practices**
1. **Commit Often:** Make small, frequent commits with clear messages to track progress.
2. **Use Descriptive Branch Names:** Name branches based on their purpose.
3. **Review Code Before Merging:** Always review pull requests to ensure code quality.
4. **Keep Branches Updated:** Regularly pull changes from `main` to avoid large conflicts.
5. **Communicate with Your Team:** Use GitHub issues or comments to discuss tasks and updates.
---
### **Deliverables**
1. A fully functional **Node.js + MySQL - Boilerplate APILinks to an external site.** backend with:
- Email sign-up and verification.
- JWT authentication with refresh tokens.
- Role-based authorization.
- Forgot password and reset password functionality.
- CRUD operations for managing accounts.
2. A fully functional **Angular 10 (17 updated) BoilerplateLinks to an external site.** frontend with:
- Email sign-up and verification.
- JWT authentication with refresh tokens.
- Role-based authorization.
- Profile management.
- Admin dashboard for managing accounts.
- **Fake backend** implementation for backend-less development.
3. A clean and well-maintained GitHub repository with:
- Proper branching structure.
- Reviewed and merged pull requests.
- Resolved merge conflicts.
4. Comprehensive **README.md documentation** covering installation, usage, testing, and contributing guidelines.
5. Test reports from **testers** ensuring the application is functional and secure.
---
### **Evaluation Criteria**
Each team member will be evaluated individually based on:
1. **Code Quality:** Clean, modular, and well-documented code.
2. **Functionality:** Correct implementation of assigned features.
3. **Collaboration:** Effective use of Git and GitHub for collaboration.
4. **Problem-Solving:** Ability to resolve merge conflicts and debug issues.
5. **Testing:** Thoroughness of testing and quality of test reports.
---