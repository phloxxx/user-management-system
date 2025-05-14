import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountService, DepartmentService } from '@app/_services';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  departments: any[] = [];

  constructor(
    private router: Router,
    private departmentService: DepartmentService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.fetchDepartments();
  }

  fetchDepartments() {
    this.departmentService.getAll()
      .pipe(first())
      .subscribe(departments => this.departments = departments);
  }

  // Account method to return the current user
  account() {
    return this.accountService.accountValue;
  }

  // Navigation methods referenced in the template
  edit(id: string) {
    this.router.navigate(['/admin/departments/add-edit', { id }]);
  }

  delete(id: string) {
    const department = this.departments.find(x => x.id === id);
    if (!department) return;
    
    department.isDeleting = true;
    this.departmentService.delete(id)
      .pipe(first())
      .subscribe(() => {
        this.departments = this.departments.filter(x => x.id !== id);
      });
  }

  add() {
    this.router.navigate(['/admin/departments/add-edit']);
  }
}