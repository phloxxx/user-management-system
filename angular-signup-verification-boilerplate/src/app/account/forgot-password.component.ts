import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first, finalize } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'forgot-password.component.html' })
export class ForgotPasswordComponent implements OnInit {
    form: UntypedFormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        console.log('Form submitted, valid:', !this.form.invalid);

        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        console.log('Calling forgotPassword with:', this.f.email.value);
        
        this.accountService.forgotPassword(this.f.email.value)
            .pipe(
                first(),
                finalize(() => {
                    this.loading = false;
                    console.log('Request completed');
                })
            )
            .subscribe({
                next: () => {
                    console.log('Success response received');
                    this.alertService.success('Please check your email for password reset instructions');
                },
                error: error => {
                    console.error('Error received:', error);
                    this.alertService.error(error);
                }
            });
    }
}