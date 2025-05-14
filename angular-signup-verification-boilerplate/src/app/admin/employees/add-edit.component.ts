import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { EmployeeService } from '@app/_services/employee.service';
import { DepartmentService } from '@app/_services/department.service';
import { AccountService, AlertService } from '@app/_services';
import { Role } from '@app/_models';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
  id: string;
  isEditMode = false;
  employee: any = {
    employeeId: '',
    userId: null,
    position: '',
    departmentId: null,
    hireDate: '',
    status: 'Active'
  };
  errorMessage: string;
  users: any[] = [];
  departments: any[] = [];
  allEmployees: any[] = [];
  availableUsers: any[] = []; // Filtered list of available users
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isEditMode = !!this.id;
    
    // Load departments
    this.departmentService.getAll()
      .pipe(first())
      .subscribe({
        next: (departments) => this.departments = departments,
        error: (error) => this.alertService.error('Error loading departments: ' + error)
      });
      
    // Load users and filter available ones
    this.accountService.getAll()
      .pipe(first())
      .subscribe({
        next: (users) => {
          this.users = users;
          this.loadEmployeesForFiltering();
        },
        error: (error) => this.alertService.error('Error loading users: ' + error)
      });
    
    if (this.isEditMode) {
      // Load employee data
      this.employeeService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (employee) => this.employee = employee,
          error: (error) => {
            this.alertService.error('Error loading employee: ' + error);
            this.errorMessage = 'Could not load employee data';
          }
        });
    } else {
      // If adding a new employee, get all employees to generate a proper ID
      this.employeeService.getAll()
        .pipe(first())
        .subscribe({
          next: (employees) => {
            this.allEmployees = employees;
            this.generateEmployeeId();
          }
        });
    }
  }
  
  save() {
    this.alertService.clear();
    if (this.isEditMode) {
      // Update existing employee
      this.employeeService.update(this.id, this.employee)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Employee updated successfully', { keepAfterRouteChange: true });
            this.router.navigate(['../'], { relativeTo: this.route });
          },
          error: error => {
            this.alertService.error(error);
            this.errorMessage = 'Could not update employee';
          }
        });
    } else {
      // Create new employee
      this.employeeService.create(this.employee)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Employee created successfully', { keepAfterRouteChange: true });
            this.router.navigate(['../'], { relativeTo: this.route });
          },
          error: error => {
            this.alertService.error(error);
            this.errorMessage = 'Could not create employee';
          }
        });
    }
  }
  
  cancel() {
    // Navigate back to the employee list page
    this.router.navigate(['/admin/employees']);
  }

  // Check if the current user is an admin
  isAdmin(): boolean {
    return this.accountService.accountValue?.role === Role.Admin;
  }

  // Generate a new employee ID based on existing format
  private generateEmployeeId() {
    if (this.allEmployees.length === 0) {
      // Default start if no employees exist
      this.employee.employeeId = 'EMP001';
      return;
    }

    // Find the highest employee ID number
    let highestNumber = 0;
    const prefix = 'EMP';
    
    this.allEmployees.forEach(emp => {
      if (emp.employeeId && emp.employeeId.startsWith(prefix)) {
        // Extract numeric part
        const numStr = emp.employeeId.substring(prefix.length);
        const num = parseInt(numStr, 10);
        
        if (!isNaN(num) && num > highestNumber) {
          highestNumber = num;
        }
      }
    });
    
    // Format the new ID with leading zeros
    const nextNumber = highestNumber + 1;
    const paddedNumber = nextNumber.toString().padStart(3, '0');
    this.employee.employeeId = `${prefix}${paddedNumber}`;
  }

  // Load all employees to check which accounts are already assigned
  private loadEmployeesForFiltering() {
    this.employeeService.getAll()
      .pipe(first())
      .subscribe({
        next: (employees) => {
          this.allEmployees = employees;
          this.filterAvailableUsers();
        },
        error: (error) => this.alertService.error('Error loading employees: ' + error)
      });
  }
  
  // Filter users to only show active and unassigned accounts
  private filterAvailableUsers() {
    // Get list of user IDs that are already assigned to employees
    const assignedUserIds = this.allEmployees
      .filter(emp => emp.id !== parseInt(this.id || '0')) // Exclude current employee when editing
      .map(emp => emp.userId);
    
    // Filter to only active accounts that aren't already assigned
    this.availableUsers = this.users.filter(user => {
      // Include active accounts that aren't assigned or are assigned to the current employee
      const isActive = user.isActive !== false; // Consider undefined as active
      const isUnassigned = !assignedUserIds.includes(user.id);
      const isCurrentUserAccount = this.employee.userId === user.id;
      
      return isActive && (isUnassigned || isCurrentUserAccount);
    });
    
    // Log for debugging
    console.log('Available users for selection:', this.availableUsers);
    
    // If editing and the current user is not in available users, add them
    if (this.isEditMode && this.employee.userId) {
      const currentUser = this.users.find(u => u.id === this.employee.userId);
      if (currentUser && !this.availableUsers.some(u => u.id === currentUser.id)) {
        this.availableUsers.push(currentUser);
      }
    }
  }
}