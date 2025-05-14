import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
    import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { EmployeeService } from '@app/_services/employee.service';
import { Request, RequestItem } from '@app/_models/request';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
  id: string;
  employees: any[] = []; // Add employees array
  request: any = {
    type: 'Equipment',
    employeeId: null,
    requestItems: []
  };
  errorMessage: string;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private employeeService: EmployeeService, // Add employee service
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    
    // Load employees data
    this.loadEmployees();
    
    // Load existing request data if in edit mode
    if (this.id) {
      // Implementation of loading existing request data would go here
      // For now, we'll just set up the structure
    } else {
      // If the current user is not an admin, pre-select their employee ID
      const account = this.accountService.accountValue;
      if (account && account.role !== 'Admin') {
        // Find the employee associated with this user
        // This would typically come from a user profile or similar
        // For now, we'll handle this when employees are loaded
      }
    }
  }
  
  // Load all employees for the dropdown
  private loadEmployees() {
    this.employeeService.getAll()
      .pipe(first())
      .subscribe({
        next: (employees) => {
          this.employees = employees;
          
          // If not an admin, try to pre-select the current user's employee ID
          const account = this.accountService.accountValue;
          if (!this.id && account && account.role !== 'Admin') {
            // Find the employee with matching user ID if possible
            const currentEmployee = this.employees.find(e => e.userId === account.id);
            if (currentEmployee) {
              this.request.employeeId = currentEmployee.id;
            }
          }
        },
        error: (error) => {
          this.errorMessage = 'Error loading employees: ' + error;
        }
      });
  }
  
  // Add a new request item
  addItem() {
    this.request.requestItems = this.request.requestItems || [];
    this.request.requestItems.push({ name: '', quantity: 1 });
  }
  
  // Remove an item by index
  removeItem(index: number) {
    this.request.requestItems.splice(index, 1);
  }
  
  // Save the request
  save() {
    this.alertService.clear();
    this.errorMessage = '';
    
    // Validate the request
    if (!this.request.type) {
      this.errorMessage = 'Request type is required';
      return;
    }
    
    if (!this.request.employeeId) {
      this.errorMessage = 'Employee is required';
      return;
    }
    
    if (!this.request.requestItems || this.request.requestItems.length === 0) {
      this.errorMessage = 'At least one item is required';
      return;
    }
    
    // Validate each request item
    const invalidItems = this.request.requestItems.filter(item => !item.name || !item.quantity);
    if (invalidItems.length > 0) {
      this.errorMessage = 'All items must have a name and quantity';
      return;
    }
    
    // Implementation of saving the request would go here
    // For now, just show success message and return to list
    this.alertService.success('Request saved successfully', { keepAfterRouteChange: true });
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  
  // Return to the requests list
  cancel() {
    // Always navigate back to the requests list
    this.router.navigate(['/admin/requests']);
  }
}
