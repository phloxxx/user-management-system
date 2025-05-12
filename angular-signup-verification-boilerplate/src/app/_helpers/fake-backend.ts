import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize, mergeMap } from 'rxjs/operators';

import { AlertService } from '@app/_services';
import { Role } from '@app/_models';

// array in local storage for accounts
const accountsKey = 'angular-10-signup-verification-boilerplate-accounts';
let accounts = JSON.parse(localStorage.getItem(accountsKey)) || [];

// Ensure all accounts have isActive property
accounts = accounts.map(account => {
    // Default to active if not specified
    if (account.isActive === undefined) {
        account.isActive = true;
    }
    
    // Ensure admin accounts are always active
    if (account.role === Role.Admin) {
        account.isActive = true;
    }
    
    return account;
});

// Save the updated accounts back to localStorage
localStorage.setItem(accountsKey, JSON.stringify(accounts));

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    constructor(private alertService: AlertService) { }

    private users = [
        { id: 1, email: 'admin@example.com', password: 'admin', role: 'Admin', employeeId: 1 },
        { id: 2, email: 'user@example.com', password: 'user', role: 'User', employeeId: 2 }
    ];

    private employees = [
        { id: 1, employeeId: 'EMP001', userId: 1, position: 'Developer', departmentId: 1, hireDate: '2025-01-01', status: 'Active' },
        { id: 2, employeeId: 'EMP002', userId: 2, position: 'Designer', departmentId: 2, hireDate: '2025-02-01', status: 'Active' }
    ];

    private departments = [
        { id: 1, name: 'Engineering', description: 'Software development team', employeeCount: 1 },
        { id: 2, name: 'Marketing', description: 'Marketing team', employeeCount: 1 }
    ];

    private workflows = [
        { id: 1, employeeId: 1, type: 'Onboarding', details: { task: 'Setup workstation' }, status: 'Pending' }
    ];

    private requests = [
        { id: 1, employeeId: 2, type: 'Equipment', requestItems: [{ name: 'Laptop', quantity: 1 }], status: 'Pending' }
    ];

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        const alertService = this.alertService;
        // Store a reference to 'this' to access class properties inside closures
        const self = this;

        return handleRoute();

        function handleRoute() {
            // Handle authentication and account-related routes
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/accounts/refresh-token') && method === 'POST':
                    return refreshToken();
                case url.endsWith('/accounts/revoke-token') && method === 'POST':
                    return revokeToken();
                case url.endsWith('/accounts/register') && method === 'POST':
                    return register();
                case url.endsWith('/accounts/verify-email') && method === 'POST':
                    return verifyEmail();
                case url.endsWith('/accounts/forgot-password') && method === 'POST':
                    return forgotPassword();
                case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
                    return validateResetToken();
                case url.endsWith('/accounts/reset-password') && method === 'POST':
                    return resetPassword();
                case url.endsWith('/accounts') && method === 'GET':
                    return getAccounts();
                case url.match(/\/accounts\/\d+$/) && method === 'GET':
                    return getAccountById();
                case url.endsWith('/accounts') && method === 'POST':
                    return createAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return updateAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteAccount();
                case url.match(/\/accounts\/\d+\/status$/) && method === 'PUT':
                    return updateAccountStatus();
                // HR System routes    
                case url.endsWith('/employees') && method === 'GET':
                    return getEmployees();
                case url.endsWith('/employees') && method === 'POST':
                    return createEmployee();
                case url.match(/\/employees\/\d+$/) && method === 'GET':
                    return getEmployeeById();
                case url.match(/\/employees\/\d+$/) && method === 'PUT':
                    return updateEmployee();
                case url.match(/\/employees\/\d+$/) && method === 'DELETE':
                    return deleteEmployee();
                case url.match(/\/employees\/\d+\/transfer$/) && method === 'POST':
                    return transferEmployee();
                case url.endsWith('/departments') && method === 'GET':
                    return getDepartments();
                case url.endsWith('/departments') && method === 'POST':
                    return createDepartment();
                case url.match(/\/departments\/\d+$/) && method === 'PUT':
                    return updateDepartment();
                case url.match(/\/departments\/\d+$/) && method === 'DELETE':
                    return deleteDepartment();
                case url.match(/\/workflows\/employee\/\d+$/) && method === 'GET':
                    return getEmployeeWorkflows();
                case url.endsWith('/workflows') && method === 'POST':
                    return createWorkflow();
                case url.endsWith('/requests') && method === 'GET':
                    return getRequests();
                case url.endsWith('/requests') && method === 'POST':
                    return createRequest();
                case url.match(/\/requests\/\d+$/) && method === 'PUT':
                    return updateRequest();
                case url.match(/\/requests\/\d+$/) && method === 'DELETE':
                    return deleteRequest();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }
        }

        // HR System route functions
        function getEmployees() {
            return authorize(null, () => ok(self.employees));
        }
        
        function createEmployee() {
            return authorize('Admin', () => {
                const employee = { id: self.employees.length + 1, ...body };
                self.employees.push(employee);
                return ok(employee);
            });
        }
        
        function getEmployeeById() {
            return authorize(null, () => {
                const id = parseInt(url.split('/').pop()!);
                const employee = self.employees.find(e => e.id === id);
                return employee ? ok(employee) : error('Employee not found');
            });
        }
        
        function updateEmployee() {
            return authorize('Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                const employeeIndex = self.employees.findIndex(e => e.id === id);
                if (employeeIndex === -1) return error('Employee not found');
                self.employees[employeeIndex] = { id, ...body };
                return ok(self.employees[employeeIndex]);
            });
        }
        
        function deleteEmployee() {
            return authorize('Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                self.employees = self.employees.filter(e => e.id !== id);
                return ok({ message: 'Employee deleted' });
            });
        }
        
        function transferEmployee() {
            return authorize('Admin', () => {
                const id = parseInt(url.split('/')[2]);
                const employee = self.employees.find(e => e.id === id);
                if (!employee) return error('Employee not found');
                employee.departmentId = body.departmentId;
                self.workflows.push({ 
                    id: self.workflows.length + 1, 
                    employeeId: id, 
                    type: 'Transfer', 
                    details: body, 
                    status: 'Pending' 
                });
                return ok({ message: 'Employee transferred' });
            });
        }
        
        function getDepartments() {
            return authorize(null, () => ok(self.departments));
        }
        
        function createDepartment() {
            return authorize('Admin', () => {
                const department = { id: self.departments.length + 1, ...body, employeeCount: 0 };
                self.departments.push(department);
                return ok(department);
            });
        }
        
        function updateDepartment() {
            return authorize('Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                const deptIndex = self.departments.findIndex(d => d.id === id);
                if (deptIndex === -1) return error('Department not found');
                self.departments[deptIndex] = { 
                    id, 
                    ...body, 
                    employeeCount: self.departments[deptIndex].employeeCount 
                };
                return ok(self.departments[deptIndex]);
            });
        }
        
        function deleteDepartment() {
            return authorize('Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                self.departments = self.departments.filter(d => d.id !== id);
                return ok({ message: 'Department deleted' });
            });
        }
        
        function getEmployeeWorkflows() {
            return authorize(null, () => {
                const employeeId = parseInt(url.split('/').pop()!);
                const workflows = self.workflows.filter(w => w.employeeId === employeeId);
                return ok(workflows);
            });
        }
        
        function createWorkflow() {
            return authorize('Admin', () => {
                const workflow = { id: self.workflows.length + 1, ...body };
                self.workflows.push(workflow);
                return ok(workflow);
            });
        }
        
        function getRequests() {
            return authorize('Admin', () => ok(self.requests));
        }
        
        function createRequest() {
            return authorize(null, () => {
                const user = getUser();
                const request = { 
                    id: self.requests.length + 1, 
                    employeeId: user.employeeId,
                    ...body 
                };
                self.requests.push(request);
                return ok(request);
            });
        }
        
        function updateRequest() {
            return authorize('Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                const reqIndex = self.requests.findIndex(r => r.id === id);
                if (reqIndex === -1) return error('Request not found');
                self.requests[reqIndex] = { id, ...body };
                return ok(self.requests[reqIndex]);
            });
        }
        
        function deleteRequest() {
            return authorize('Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                self.requests = self.requests.filter(r => r.id !== id);
                return ok({ message: 'Request deleted' });
            });
        }

        // Account route functions
        function authenticate() {
            const { email, password } = body;
            
            // First, find the account by email and password
            const account = accounts.find(x => x.email === email && x.password === password);
            
            // Check if account exists and is verified
            if (!account || !account.isVerified) {
                return error('Email or password is incorrect');
            }
            
            // Check if the account is active for non-admin users
            if (account.role !== Role.Admin && account.isActive === false) {
                return error('Your account has been deactivated. Please contact an administrator.');
            }
            
            // Authentication successful - proceed with token generation
            account.refreshTokens = account.refreshTokens || [];
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            
            return ok({
                ...basicDetails(account),
                jwtToken: generateJwtToken(account)
            });
        }

        function refreshToken() {
            const refreshToken = getRefreshToken();

            if (!refreshToken) return unauthorized();

            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));

            if (!account) return unauthorized();

            // replace old refresh token with a new one and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({
                ...basicDetails(account),
                jwtToken: generateJwtToken(account)
            });
        }

        function revokeToken() {
            if (!isAuthenticated()) return unauthorized();

            const refreshToken = getRefreshToken();
            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));

            // revoke token and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function register() {
            const account = body;

            if (accounts.find(x => x.email === account.email)) {
                // display email already registered "email" in alert
                setTimeout(() => {
                    alertService.info(`
                    <h4>Email Already Registered</h4>
                    <p>Your email <strong>${account.email}</strong> is already registered.</p>
                    <p>If you don't know your password please visit the <a href="${location.origin}/account/forgot-password">forgot password</a> page.</p>
                    <div><strong>Note:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);

                // always return ok() response to prevent email enumeration
                return ok();
            }

            // assign account id and a few other properties then save
            account.id = newAccountId();
            if (account.id === 1) {
                // first registered account is an admin
                account.role = Role.Admin;
            } else {
                account.role = Role.User;
            }
            account.dateCreated = new Date().toISOString();
            account.verificationToken = new Date().getTime().toString();
            account.isVerified = false;
            account.isActive = true;
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // display verification email in alert
            setTimeout(() => {
                const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                alertService.info(`
                <h4>Verification Email</h4>
                <p>Thanks for registering!</p>
                <p>Please click the below link to verify your email address:</p>
                <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                <div><strong>Note:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                `, { autoClose: false });
            }, 1000);

            return ok();
        }

        function verifyEmail() {
            const { token } = body;
            const account = accounts.find(x => !!x.verificationToken && x.verificationToken === token);

            if (!account) return error('Verification failed');

            // set is verified flag to true if token is valid
            account.isVerified = true;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function forgotPassword() {
            const { email } = body;
            const account = accounts.find(x => x.email === email);

            // always return ok() response to prevent email enumeration
            if (!account) return ok();

            // create reset token that expires after 24 hours
            account.resetToken = new Date().getTime().toString();
            account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // display password reset email in alert
            setTimeout(() => {
                const resetUrl = `${location.origin}/account/reset-password?token=${account.resetToken}`;
                alertService.info(`
                <h4>Reset Password Email</h4>
                <p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <div><strong>Note:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                `, { autoClose: false });
            }, 1000);

            return ok();
        }

        function validateResetToken() {
            const { token } = body;
            const account = accounts.find(x => x.resetToken && x.resetToken === token && new Date() < new Date(x.resetTokenExpires));

            if (!account) return error('Invalid token');

            return ok();
        }

        function resetPassword() {
            const { token, password } = body;
            const account = accounts.find(x =>
                !!x.resetToken && x.resetToken === token &&
                new Date() < new Date(x.resetTokenExpires)
            );

            if (!account) return error('Invalid token');

            // update password and remove reset token
            account.password = password;
            account.isVerified = true;
            delete account.resetToken;
            delete account.resetTokenExpires;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function getAccounts() {
            if (!isAuthenticated()) return unauthorized();
            return ok(accounts.map(x => basicDetails(x)));
        }

        function getAccountById() {
            if (!isAuthenticated()) return unauthorized();

            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can get own profile and admin accounts can get all profiles
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            return ok(basicDetails(account));
        }

        function createAccount() {
            if (!isAuthorized(Role.Admin)) return unauthorized();

            if (body.isActive === undefined) {
                body.isActive = true;
            }
            if (body.role === 'Admin') {
                body.isActive = true;
            }
            
            const account = body;
            if (accounts.find(x => x.email === account.email)) {
                return error(`Email ${account.email} is already registered`);
            }

            // assign account id and a few other properties then save
            account.id = newAccountId();
            account.dateCreated = new Date().toISOString();
            account.isVerified = true;
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function updateAccount() {
            if (!isAuthenticated()) return unauthorized();

            let params = body;
            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can update own profile and admin accounts can update all profiles
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            // only update password if included
            if (!params.password) {
                delete params.password;
            }

            // don't save confirm password
            delete params.confirmPassword;

            // update and save account
            Object.assign(account, params);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok(basicDetails(account));
        }

        function deleteAccount() {
            if (!isAuthenticated()) return unauthorized();

            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can delete own account and admin accounts can delete any account
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            // delete account then save
            accounts = accounts.filter(x => x.id !== idFromUrl());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function updateAccountStatus() {
            if (!isAuthenticated() || !isAuthorized(Role.Admin)) {
                return unauthorized();
            }
            
            // Extract the account ID from the URL (e.g., /accounts/123/status)
            const urlParts = url.split('/');
            const id = parseInt(urlParts[urlParts.length - 2]);
            
            // Find the account by ID
            const account = accounts.find(x => x.id === id);
            
            // Check if account exists
            if (!account) {
                return notFound();
            }
            
            // Don't allow changing status of admin accounts
            if (account.role === Role.Admin) {
                return error('Cannot change status of admin accounts');
            }
            
            // Update the account status
            account.isActive = !!body.isActive;
            
            // Save the updated accounts to localStorage
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            
            // Return the updated account details
            return ok({
                ...basicDetails(account)
            });
        }

        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500));
        }

        function error(message) {
            return throwError({ error: { message } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorized' } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function notFound() {
            return throwError({ status: 404, error: { message: 'Not Found' } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function authorize(requiredRole, callback) {
            const user = getUser();
            if (!user) return unauthorized();
            if (requiredRole && user.role !== requiredRole) return error('Forbidden');
            return callback();
        }

        function getUser() {
            const authHeader = headers.get('Authorization');
            if (!authHeader || authHeader !== 'Bearer fake-jwt-token') return null;
            
            // Since we're using a fake token, just return the first user that matches the role
            // In a real implementation, we would decode the token and find the user by ID
            return self.users.find(u => u.email === 'admin@example.com'); // Default to admin user for simplicity
        }

        function basicDetails(account) {
            const { id, title, firstName, lastName, email, role, dateCreated, isVerified, isActive } = account;
            return { id, title, firstName, lastName, email, role, dateCreated, isVerified, isActive };
        }

        function isAuthenticated() {
            return !!currentAccount();
        }

        function isAuthorized(role) {
            const account = currentAccount();
            if (!account) return false;
            return account.role === role;
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }

        function newAccountId() {
            return accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
        }

        function currentAccount() {
            const authHeader = headers.get('Authorization');
            if (!authHeader.startsWith('Bearer fake-jwt-token')) return;

            const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
            const tokenExpired = Date.now() > (jwtToken.exp * 1000);
            if (tokenExpired) return;

            const account = accounts.find(x => x.id === jwtToken.id);
            return account;
        }

        function generateJwtToken(account) {
            const tokenPayload = {
                exp: Math.round(new Date(Date.now() + 15 * 60 * 1000).getTime() / 1000),
                id: account.id
            };
            return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
        }

        function generateRefreshToken() {
            const token = new Date().getTime().toString();
            const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;
            return token;
        }

        function getRefreshToken() {
            return (document.cookie.split(';').find(x => x.includes('fakeRefreshToken')) || '=').split('=')[1];
        }

        function ensureAdminAccountsActive() {
            const accountsData = localStorage.getItem(accountsKey);
            if (accountsData) {
                const allAccounts = JSON.parse(accountsData);
                let needsUpdate = false;
                
                // Make sure all admin accounts are active
                allAccounts.forEach(account => {
                    if (account.role === 'Admin' && account.isActive === false) {
                        account.isActive = true;
                        needsUpdate = true;
                    }
                });
                
                if (needsUpdate) {
                    localStorage.setItem(accountsKey, JSON.stringify(allAccounts));
                }
            }
        }
    }
}

export const fakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
