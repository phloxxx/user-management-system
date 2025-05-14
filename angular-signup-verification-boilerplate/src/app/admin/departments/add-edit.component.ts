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

  save() {
    // Clear previous errors
    this.alertService.clear();
    this.errorMessage = undefined;
    
    // Validate form
    if (!this.department.name) {
      this.errorMessage = 'Department name is required';
      return;
    }
    
    // Show submitting state
    this.submitting = true;

    // Log auth status before making the request
    console.log('Saving department - Operation:', this.id ? 'Update' : 'Create', 'Department:', this.department);
    
    // Create or update based on whether we have an id
    const saveObservable = this.id ?
      this.departmentService.update(this.id, this.department) :
      this.departmentService.create(this.department);

    saveObservable
      .pipe(first())
      .subscribe({
        next: (result) => {
          console.log('Department saved successfully:', result);
          this.alertService.success('Department saved successfully', { keepAfterRouteChange: true });
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = 'Error saving department: ' + error;
          this.alertService.error(this.errorMessage);
          console.error('Error saving department:', error);
          
          // Additional error diagnostics
          if (error === 'Unauthorized') {
            console.error('Authentication issue detected. This could be due to:');
            console.error('1. Missing or expired authentication token');
            console.error('2. Insufficient permissions (Admin role required)');
            console.error('3. Issue with token validation in the backend');
          }
        }
      });
  }

  cancel() {
    // Navigate back to departments list
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}