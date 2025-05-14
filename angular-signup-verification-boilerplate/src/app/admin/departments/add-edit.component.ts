import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { Department } from '@app/_models';
import { DepartmentService, AlertService } from '@app/_services';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
  id: string;
  department: Department = {
    name: '',
    description: ''
  };
  errorMessage: string;
  submitting = false;
  loading = false;
  submitted = false;
  successMessage: string = '';
  
  constructor(
    private departmentService: DepartmentService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    
    // If id exists, load the department data
    if (this.id) {
      // Don't show loading indicator for fast responses
      this.departmentService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (department) => {
            if (department) {
              this.department = department;
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading department data:', error);
            // Show a quick toast instead of blocking the UI
            this.alertService.error('Department data could not be loaded', { autoClose: true, keepAfterRouteChange: false });
            this.loading = false;
          }
        });
    } else {
      console.log('Add mode - no department data to load');
    }
  }

  isFormInvalid(): boolean {
    return !this.department.name || this.department.name.trim() === '' || 
           !this.department.description || this.department.description.trim() === '';
  }

  save() {
    this.submitted = true;
    this.clearMessages();
    
    // Return if form is invalid
    if (this.isFormInvalid()) {
      this.errorMessage = 'Please complete all required fields before saving.';
      return;
    }
    
    try {
      if (this.id) {
        this.departmentService.update(this.id, this.department)
          .pipe(first())
          .subscribe({
            next: () => {
              this.successMessage = 'Department updated successfully';
              setTimeout(() => this.router.navigate(['../'], { relativeTo: this.route }), 1500);
            },
            error: error => {
              this.errorMessage = error;
            }
          });
      } else {
        this.departmentService.create(this.department)
          .pipe(first())
          .subscribe({
            next: () => {
              this.successMessage = 'Department added successfully';
              setTimeout(() => this.router.navigate(['../'], { relativeTo: this.route }), 1500);
            },
            error: error => {
              this.errorMessage = error;
            }
          });
      }
    } catch (err) {
      this.errorMessage = 'An unexpected error occurred. Please try again.';
      console.error(err);
    }
  }

  clearError() {
    this.errorMessage = '';
  }

  clearSuccess() {
    this.successMessage = '';
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancel() {
    this.submitted = false;
    this.clearMessages();
    // Navigate back to departments list
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}