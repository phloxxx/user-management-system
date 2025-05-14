import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { forkJoin } from 'rxjs'; // Import forkJoin from rxjs, not from operators
import { Router } from '@angular/router';

import { AccountService } from '@app/_services';
import { EmployeeService } from '@app/_services/employee.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  templateUrl: 'list.component.html'
})
export class ListComponent implements OnInit {
  requests: any[] = [];
  employees: any[] = [];
  accounts: any[] = [];
  loading = false;

  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loading = true;
    
    // Load both employees and accounts data to match them
    forkJoin([
      this.employeeService.getAll(),
      this.accountService.getAll()
    ]).pipe(first()).subscribe({
      next: ([employees, accounts]) => {
        this.employees = employees;
        this.accounts = accounts;
        this.loadRequests();
      },
      error: error => {
        console.error('Error loading data:', error);
        this.loadRequests(); // Still try to load requests
      }
    });
  }

  loadRequests() {
    // Load requests from API
    this.http.get<any[]>(`${environment.apiUrl}/requests`)
      .pipe(first())
      .subscribe({
        next: requests => {
          this.requests = requests;
          this.loading = false;
        },
        error: error => {
          console.error('Error loading requests:', error);
          this.loading = false;
        }
      });
  }
  
  getEmployeeInfo(employeeId: number): string {
    if (!employeeId) return 'Unknown';
    
    // Find the employee by ID
    const employee = this.employees.find(emp => emp.id === employeeId);
    
    if (employee) {
      // Find the associated account for this employee
      const account = this.accounts.find(acc => acc.id === employee.userId);
      
      if (account) {
        // Return email and role as shown in the image
        const role = account.role === 'Admin' ? 'Admin User' : 'Normal User';
        return `${account.email} (${role})`;
      }
      
      return `${employee.employeeId}`;
    }
    
    return `Employee ID: ${employeeId}`;
  }

  account() {
    return this.accountService.accountValue;
  }

  add() {
    this.router.navigate(['/admin/requests/add']);
  }

  edit(id: number) {
    this.router.navigate(['/admin/requests/edit', id]);
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this request?')) {
      // Delete request API call
      this.http.delete(`${environment.apiUrl}/requests/${id}`)
        .pipe(first())
        .subscribe({
          next: () => {
            this.requests = this.requests.filter(r => r.id !== id);
          },
          error: error => {
            console.error('Error deleting request:', error);
          }
        });
    }
  }
}
