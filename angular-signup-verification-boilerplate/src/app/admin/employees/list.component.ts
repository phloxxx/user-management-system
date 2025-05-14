import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { AccountService, AlertService } from '@app/_services';
import { EmployeeService } from '@app/_services/employee.service';
import { DepartmentService } from '@app/_services/department.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
    employees: any[] = [];
    users: any[] = [];
    departments: any[] = [];
    loading: boolean = false;
    
    constructor(
        private employeeService: EmployeeService,
        private accountService: AccountService,
        private departmentService: DepartmentService,
        private alertService: AlertService,
        private router: Router,
        private http: HttpClient
    ) {}

    ngOnInit() {
        this.loading = true;
        this.loadAllData();
    }
    
    // Load all necessary data from the API
    loadAllData() {
        // Use forkJoin to load all data in parallel
        forkJoin({
            employees: this.employeeService.getAll(),
            users: this.accountService.getAll(),
            departments: this.departmentService.getAll()
        })
        .pipe(first())
        .subscribe({
            next: (data) => {
                this.employees = data.employees;
                this.users = data.users;
                this.departments = data.departments;
                this.loading = false;
                console.log('All data loaded successfully');
            },
            error: (error) => {
                console.error('Error loading data:', error);
                this.alertService.error('Failed to load data. Please try again.');
                this.loading = false;
            }
        });
    }

    fetchEmployees() {
        this.loading = true;
        this.employeeService.getAll()
            .pipe(first())
            .subscribe({
                next: (employees) => {
                    this.employees = employees;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error fetching employees:', error);
                    this.alertService.error('Failed to load employees');
                    this.loading = false;
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
                        this.alertService.success('Employee deleted');
                        this.fetchEmployees();
                    },
                    error: (error) => {
                        console.error('Error deleting employee:', error);
                        this.alertService.error('Failed to delete employee');
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

    getUserEmail(userId: any): string {
        if (!userId) {
            return 'No User Assigned';
        }
        
        const userIdStr = userId.toString();
        const user = this.users.find(x => x.id.toString() === userIdStr);
        
        if (user) {
            return user.email;
        } else {
            return `Unknown User`;
        }
    }

    getDepartmentName(departmentId: any): string {
        if (!departmentId) {
            return 'No Department';
        }
        
        const deptIdNum = Number(departmentId);
        const department = this.departments.find(x => Number(x.id) === deptIdNum);
        
        if (department) {
            return department.name;
        } else {
            return `Unknown Department`;
        }
    }
}