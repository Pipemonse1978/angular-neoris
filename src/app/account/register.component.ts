import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({
    templateUrl: 'register.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, NgClass, NgIf, RouterLink]
})
export class RegisterComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {
        if (this.accountService.userValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            nombre: ['', Validators.required],
            correo: ['', Validators.required, Validators.email],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            rol: ['', Validators.required],
            fechaAlta: [new Date().toLocaleDateString('es-MX')]
        });
    }

    get f() { return this.form.controls; }

    onSubmit() {

        this.submitted = true;
        this.alertService.clear();
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.accountService.register(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Registro exitoso', true);
                    this.router.navigate(['/account/login'], { queryParams: { registered: true }});
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}
