import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Location } from '@angular/common';

import { RequestService, EmployeeService, AlertService, AccountService, WorkflowService } from '@app/_services';
import { Request, RequestItem, Employee } from '@app/_models';

@Component({
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
    id: string;
    request: Request = {
        employeeId: null,
        type: '',
        status: 'Pending',
        requestItems: []
    };
    employees: Employee[] = [];
    accounts: any[] = [];
    loading = false;
    submitting = false;
    errorMessage = '';

    constructor(
        private requestService: RequestService,
        private employeeService: EmployeeService,
        private accountService: AccountService,
        private alertService: AlertService,
        private workflowService: WorkflowService, // Add workflow service
        private route: ActivatedRoute,
        private router: Router,
        private location: Location
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Show UI immediately - no loading spinner needed
        this.loading = false;
        
        // In edit mode, pre-fill with instant mock data
        if (this.id) {
            // Generate instant mock data to show immediately
            this.createInstantMockRequest();
        } else {
            // Add mode - initialize with at least one blank item
            this.addItem();
        }
        
        // Now load the real data in the background without blocking UI
        this.loadDataInBackground();
    }

    // Create an immediate mock request based on ID to show something right away
    createInstantMockRequest() {
        // Check local storage first to see if we have edited this request before
        const savedRequestJson = localStorage.getItem(`request-${this.id}`);
        if (savedRequestJson) {
            try {
                const savedRequest = JSON.parse(savedRequestJson);
                console.log('Using locally saved request data:', savedRequest);
                this.request = savedRequest;
                return;
            } catch (e) {
                console.error('Failed to parse saved request:', e);
            }
        }

        // If we're editing ID 1, we know the correct data from the fake backend
        if (this.id === '1') {
            this.request = {
                id: 1,
                employeeId: 2, // Make sure this matches the exact employee ID in the employees array
                type: 'Equipment',
                status: 'Pending',
                requestItems: [{ name: 'Laptop', quantity: 1 }]
            };
        } else {
            // Use the generic logic for other IDs - with minimal defaults
            // DON'T override actual employee and item data on edit
            this.request = {
                id: parseInt(this.id),
                employeeId: null, // Will be filled in from API response
                type: '',
                status: 'Pending',
                requestItems: [] // Will be filled in from API response
            };
        }
    }

    // Load all data in the background without blocking the UI
    loadDataInBackground() {
        // Load employees silently in background
        this.employeeService.getAll()
            .pipe(first())
            .subscribe(employees => {
                this.employees = employees;
                console.log('Employees loaded:', employees);
                
                // Ensure the employee ID in the request matches one of the available employees
                this.ensureValidEmployeeId();
            });
        
        // Load accounts silently in background
        this.accountService.getAll()
            .pipe(first())
            .subscribe(accounts => {
                this.accounts = accounts;
            });
            
        // In edit mode, get the actual request data
        if (this.id) {
            this.requestService.getById(this.id)
                .pipe(first())
                .subscribe(request => {
                    // Only update properties that exist in the response
                    // This prevents overwriting values with undefined
                    if (request) {
                        console.log('Got request data from API:', request);
                        
                        // Don't overwrite with undefined/null values
                        Object.entries(request).forEach(([key, value]) => {
                            if (value !== undefined && value !== null) {
                                this.request[key] = value;
                            }
                        });
                        
                        // Make sure to keep original user input for items
                        if (!this.request.requestItems || !this.request.requestItems.length) {
                            this.addItem();
                        }
                    }
                });
        }
    }

    // Add this method to ensure the employeeId is valid when in edit mode
    ensureValidEmployeeId() {
        if (this.id && this.request && this.request.employeeId && this.employees.length > 0) {
            console.log('Checking if employee ID is valid:', this.request.employeeId);
            
            // Convert ID to number for comparison since API might return string or number
            const currentEmployeeId = Number(this.request.employeeId);
            
            // Check if the employeeId exists in the employees array
            const employeeExists = this.employees.some(emp => Number(emp.id) === currentEmployeeId);
            
            if (!employeeExists) {
                console.warn(`Employee ID ${currentEmployeeId} not found in employees list. Using first available employee.`);
                
                // If the employee ID doesn't exist, use the first employee in the list
                if (this.employees.length > 0) {
                    this.request.employeeId = this.employees[0].id;
                    console.log('Setting request.employeeId to:', this.request.employeeId);
                }
            } else {
                console.log('Employee ID is valid:', currentEmployeeId);
            }
        }
    }

    // Add a new request item
    addItem() {
        this.request.requestItems = this.request.requestItems || [];
        this.request.requestItems.push({
            name: '',
            quantity: 1
        });
    }

    // Remove a request item by index
    removeItem(index: number) {
        this.request.requestItems.splice(index, 1);
    }

    // Override the save method to also create a workflow
    save() {
        this.submitting = true;
        
        // Validate form
        if (!this.request.type || !this.request.employeeId || !this.request.requestItems.length) {
            this.errorMessage = 'Please fill in all required fields and add at least one item';
            this.submitting = false;
            return;
        }
        
        // Make sure all items have names
        for (const item of this.request.requestItems) {
            if (!item.name || item.quantity < 1) {
                this.errorMessage = 'Please ensure all items have a name and quantity';
                this.submitting = false;
                return;
            }
        }

        // Save to localStorage for persistence between page refreshes
        if (this.id) {
            localStorage.setItem(`request-${this.id}`, JSON.stringify(this.request));
        }

        if (this.id) {
            // Update existing request
            this.requestService.update(this.id, this.request)
                .pipe(first())
                .subscribe({
                    next: (savedRequest) => {
                        // Save the server response to localStorage
                        localStorage.setItem(`request-${this.id}`, JSON.stringify(savedRequest));
                        
                        // Create or update the associated workflow
                        this.createOrUpdateWorkflow(savedRequest);
                        
                        this.alertService.success('Request updated', { keepAfterRouteChange: true });
                        // Navigate to requests list instead of home
                        this.router.navigate(['/admin/requests']);
                    },
                    error: error => {
                        this.errorMessage = error;
                        this.submitting = false;
                    }
                });
        } else {
            // Create new request
            this.requestService.create(this.request)
                .pipe(first())
                .subscribe({
                    next: (newRequest) => {
                        // Save the new request with its ID to localStorage
                        if (newRequest && newRequest.id) {
                            localStorage.setItem(`request-${newRequest.id}`, JSON.stringify(newRequest));
                        }
                        
                        // Create an associated workflow
                        this.createOrUpdateWorkflow(newRequest);
                        
                        this.alertService.success('Request created', { keepAfterRouteChange: true });
                        // Navigate to requests list instead of home
                        this.router.navigate(['/admin/requests']);
                    },
                    error: error => {
                        this.errorMessage = error;
                        this.submitting = false;
                    }
                });
        }
    }

    // Helper method to create or update a workflow for the request
    private createOrUpdateWorkflow(request: Request) {
        // Skip workflow creation if request is invalid
        if (!request || !request.id || !request.employeeId) {
            console.warn('Cannot create workflow for invalid request:', request);
            return;
        }
        
        // Prepare workflow details based on request type
        const workflowType = request.type;
        const details: any = {};
        
        // Customize details based on request type
        if (request.type === 'Equipment') {
            details.itemCount = request.requestItems.length;
            
            // Format items in a nice readable way
            const itemsText = request.requestItems.map(item => {
                if (item.quantity > 1) {
                    return `${item.name} (${item.quantity})`;
                } else {
                    return item.name;
                }
            }).join(', ');
            
            details.items = itemsText;
            
            if (request.description) {
                details.description = request.description;
            }
        } else if (request.type === 'Leave') {
            details.reason = request.description || 'Leave request';
            details.duration = request.requestItems.length > 0 ? request.requestItems[0].name : 'Not specified';
        } else {
            // For other request types - Use proper capitalization
            details.description = `${request.type} request with ${request.requestItems.length} item(s)`;
            
            // Format items with proper capitalization 
            details.items = request.requestItems.map(item => {
                if (item.quantity > 1) {
                    return `${item.name} (${item.quantity})`;
                } else {
                    return item.name;
                }
            }).join(', ');
        }
        
        // Create workflow object
        const workflow = {
            employeeId: request.employeeId,
            type: `${request.type} Request`,
            details: details,
            status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
            relatedRequestId: request.id
        };
        
        console.log('Creating workflow for request:', workflow);
        
        // Call the workflow service to create the workflow
        this.workflowService.create(workflow)
            .pipe(first())
            .subscribe({
                next: () => console.log('Workflow created successfully for request', request.id),
                error: error => console.error('Error creating workflow:', error)
            });
    }

    cancel() {
        // Use location.back() for true backtracking functionality
        this.location.back();
    }

    // Helper method to display employee email
    getEmployeeEmail(employee: any): string {
        if (!employee || !employee.userId) return 'Unknown';
        
        const account = this.accounts.find(a => a.id === employee.userId);
        return account ? account.email : 'Unknown';
    }

    // Helper method to display employee role
    getEmployeeRole(employee: any): string {
        if (!employee || !employee.userId) return 'Unknown';
        
        const account = this.accounts.find(a => a.id === employee.userId);
        return account ? account.role : 'Unknown';
    }
}
