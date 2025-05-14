import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { AccountService } from '@app/_services';
import { EmployeeService } from '@app/_services/employee.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
    employees: any[] = [];
    users: any[] = []; // Add array to store users
    departments: any[] = []; // Add array to store departments
    
    constructor(
        private employeeService: EmployeeService,
        private accountService: AccountService,
        private router: Router,
        private http: HttpClient
    ) {}

    ngOnInit() {
        console.log('Employee List Component initialized');
        console.log('Current user:', this.accountService.accountValue);
        this.fetchEmployees();
        this.loadUsers();
        this.loadDepartments();
    }

    fetchEmployees() {
        console.log('Fetching employees data...');
        this.employeeService.getAll()
            .pipe(first())
            .subscribe({
                next: (employees) => {
                    console.log('Employees data fetched successfully', employees.length);
                    this.employees = employees;
                },
                error: (error) => {
                    console.error('Error fetching employees:', error);
                    // Don't logout here, let the interceptor handle authentication errors
                }
            });
    }
    
    account() {
        return this.accountService.accountValue;
    }
    
    edit(id: string) {
        this.router.navigate(['/admin/employees/edit', id]);
    }
    
    add() {
        this.router.navigate(['/admin/employees/add']);
    }
    
    transfer(employee: any) {
        this.router.navigate(['/admin/employees/transfer', employee.id]);
    }
    
    delete(id: string) {
        if (confirm('Are you sure you want to delete this employee?')) {
            this.employeeService.delete(id)
                .pipe(first())
                .subscribe({
                    next: () => {
                        // Refresh the employees list after deletion
                        this.fetchEmployees();
                    },
                    error: (error) => {
                        console.error('Error deleting employee:', error);
                    }
                });
        }
    }
    
    viewRequests(id: string) {
        this.router.navigate(['/admin/requests'], { 
            queryParams: { employeeId: id }
        });
    }
    
    viewWorkflows(id: string) {
        this.router.navigate(['/admin/employees', id, 'workflows']);
    }

    // New method to load users for lookup
    private loadUsers() {
        this.http.get(`${environment.apiUrl}/accounts`)
            .pipe(first())
            .subscribe(users => this.users = users as any[]);
    }
    
    // New method to load departments for lookup
    private loadDepartments() {
        this.http.get(`${environment.apiUrl}/departments`)
            .pipe(first())
            .subscribe(departments => this.departments = departments as any[]);
    }
    
    // New method to get user email by user ID
    getUserEmail(userId: number): string {
        const user = this.users.find(u => u.id === userId);
        return user ? user.email : 'Unknown';
    }
    
    // New method to get department name by department ID
    getDepartmentName(departmentId: number): string {
        const department = this.departments.find(d => d.id === departmentId);
        return department ? department.name : 'Unknown';
    }
}