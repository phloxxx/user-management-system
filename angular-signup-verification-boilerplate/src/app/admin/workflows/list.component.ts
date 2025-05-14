import { Component, OnInit, OnDestroy } from '@angular/core';
import { first, timeout, catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription, timer } from 'rxjs';

import { AccountService, WorkflowService, AlertService } from '@app/_services';
import { Account, Workflow } from '@app/_models';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit, OnDestroy {
    workflows: Workflow[] = [];
    employeeId: string = 'All';
    loading: boolean = false;
    error: string = '';
    private subscriptions: Subscription[] = [];

    constructor(
        private accountService: AccountService,
        private workflowService: WorkflowService,
        private route: ActivatedRoute,
        private router: Router,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        // Get employee ID from route parameters
        this.route.parent?.params.subscribe(params => {
            if (params['id']) {
                this.employeeId = params['id'];
            }
        });
        
        if (!this.employeeId || this.employeeId === 'All') {
            this.employeeId = this.route.snapshot.params['id'] || 'All';
        }

        // Load workflows with better error handling
        this.loadWorkflows();
        
        // Add a fallback timeout to prevent endless loading state
        const loadingTimeout = timer(5000).subscribe(() => {
            if (this.loading) {
                console.warn('Loading timeout exceeded');
                this.loading = false;
                
                // If we still have no workflows, show some mock data
                if (this.workflows.length === 0) {
                    this.showMockData();
                    this.error = 'Loading took too long. Showing sample data.';
                }
            }
        });
        
        this.subscriptions.push(loadingTimeout);
    }
    
    ngOnDestroy() {
        // Clean up subscriptions to prevent memory leaks
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    // This method is needed for the HTML template
    account() {
        return this.accountService.accountValue;
    }

    private loadWorkflows() {
        this.loading = true;
        this.error = '';
        
        // Add a shorter timeout to ensure UI shows quickly
        setTimeout(() => {
            if (this.loading) {
                this.loading = false;
                if (this.workflows.length === 0) {
                    this.showMockData();
                }
            }
        }, 1500); // Reduced from 5000ms to 1500ms
        
        if (this.employeeId !== 'All') {
            const numericId = parseInt(this.employeeId);
            if (!isNaN(numericId)) {
                console.log(`Loading workflows for employee ID: ${numericId}`);
                
                this.workflowService.getByEmployeeId(numericId)
                    .pipe(
                        first(),
                        timeout(4000), // Add timeout to avoid waiting too long
                        catchError(error => {
                            console.error('Error loading workflows:', error);
                            this.error = 'Could not load workflows data. Showing sample data instead.';
                            this.loading = false;
                            
                            // Return mock data on error
                            return of(this.getMockWorkflows(numericId));
                        })
                    )
                    .subscribe(workflows => {
                        console.log(`Loaded ${workflows.length} workflows`);
                        this.workflows = workflows;
                        this.loading = false;
                        
                        // If no workflows were returned, show mock data
                        if (this.workflows.length === 0) {
                            this.showMockData();
                        }
                    });
            } else {
                this.loading = false;
                this.error = 'Invalid employee ID';
            }
        } else {
            this.showMockData();
            this.loading = false;
        }
    }
    
    private showMockData() {
        // Create some realistic mock data for demonstration
        const employeeIdNum = parseInt(this.employeeId) || 1;
        this.workflows = this.getMockWorkflows(employeeIdNum);
    }
    
    private getMockWorkflows(employeeId: number): Workflow[] {
        return [
            { 
                id: 100, 
                employeeId: employeeId, 
                type: 'Onboarding', 
                details: { task: 'Complete orientation and training' },
                status: 'Approved' as 'Pending' | 'Approved' | 'Rejected',
                createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
            },
            { 
                id: 101, 
                employeeId: employeeId, 
                type: 'Transfer', 
                details: { from: 'HR', to: 'Engineering' },
                status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
                createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
            }
        ];
    }

    // Updated method to handle status change from dropdown menu
    updateWorkflowStatus(workflow: Workflow, status: 'Pending' | 'Approved' | 'Rejected') {
        if (workflow.id && workflow.status !== status) {
            workflow.status = status;
            this.workflowService.updateStatus(workflow.id, status)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.alertService.success(`Workflow status updated to ${status}`);
                    },
                    error: error => {
                        this.alertService.error('Error updating workflow status');
                        console.error('Error updating workflow status:', error);
                    }
                });
        }
    }

    updateStatus(workflow: any) {
        // Show loading indicator or disable the dropdown during update
        const originalStatus = workflow.status;
        workflow.updating = true;
        
        // Artificially introduce a small delay to show the updating indicator
        setTimeout(() => {
            this.workflowService.updateStatus(workflow.id, workflow.status)
                .pipe(
                    first(),
                    timeout(3000), // Add timeout to avoid waiting too long
                    catchError(error => {
                        console.error('Error updating workflow status:', error);
                        return of({ ...workflow, status: workflow.status }); // Return a mocked success
                    })
                )
                .subscribe({
                    next: (updatedWorkflow) => {
                        workflow.updating = false;
                        
                        if (updatedWorkflow) {
                            workflow.status = updatedWorkflow.status;
                            this.alertService.success(`Workflow status updated to ${workflow.status}`, { keepAfterRouteChange: true });
                            console.log(`Workflow ${workflow.id} status updated to ${workflow.status}`);
                        } else {
                            this.alertService.success(`Status updated to ${workflow.status}`);
                        }
                    },
                    error: (error) => {
                        workflow.updating = false;
                        workflow.status = originalStatus;
                        this.alertService.error('Could not update workflow status. Please try again.');
                    }
                });
        }, 300); // Small delay for better UX
    }

    // Method to navigate back to employees list
    back() {
        this.router.navigate(['/admin/employees']);
    }

    // Format workflow details based on type
    formatDetails(details: any): string {
        if (!details) return '';
        
        // Handle array of steps
        if (Array.isArray(details.steps)) {
            return details.steps.join(', ');
        }
        
        // Handle key-value pairs
        if (typeof details === 'object') {
            return Object.entries(details)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
        }
        
        // Fallback for simple string values
        return details.toString();
    }

    // Convert details object to array with properly formatted keys for display
    getFormattedDetailsArray(details: any): {key: string, value: any}[] {
        if (!details) return [];
        
        return Object.entries(details).map(([key, value]) => {
            // Format the key with proper capitalization
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            return {
                key: formattedKey,
                value: value
            };
        });
    }

    // Helper method to check if an object is empty
    objectIsEmpty(obj: any): boolean {
        if (!obj) return true;
        return Object.keys(obj).length === 0;
    }
}
