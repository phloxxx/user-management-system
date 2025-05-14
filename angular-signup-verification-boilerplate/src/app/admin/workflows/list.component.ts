import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { AccountService, WorkflowService, AlertService } from '@app/_services';
import { Account, Workflow } from '@app/_models';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    workflows: Workflow[] = [];
    employeeId: string = 'All';

    constructor(
        private accountService: AccountService,
        private workflowService: WorkflowService,
        private route: ActivatedRoute,
        private router: Router,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        // Get employee ID from the parent route if available
        this.route.parent?.params.subscribe(params => {
            if (params['id']) {
                this.employeeId = params['id'];
            }
        });
        
        // If not available from parent route, try current route
        if (!this.employeeId || this.employeeId === 'All') {
            this.employeeId = this.route.snapshot.params['id'] || 'All';
        }

        this.loadWorkflows();
    }

    // This method is needed for the HTML template
    account() {
        return this.accountService.accountValue;
    }

    private loadWorkflows() {
        if (this.employeeId !== 'All') {
            const numericId = parseInt(this.employeeId);
            if (!isNaN(numericId)) {
                this.workflowService.getByEmployeeId(numericId)
                    .pipe(first())
                    .subscribe(workflows => this.workflows = workflows);
            }
        } else {
            // If no specific employee ID, using mock data for now
            this.workflows = [
                { 
                    id: 1, 
                    employeeId: 1, 
                    type: 'Onboarding', 
                    details: { steps: ['Orientation', 'IT Setup', 'Training'] },
                    status: 'Pending'
                },
                { 
                    id: 2, 
                    employeeId: 2, 
                    type: 'Transfer', 
                    details: { from: 'Sales', to: 'Marketing' },
                    status: 'Approved'
                }
            ];
        }
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
}
