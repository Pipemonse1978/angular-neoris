import { Component, OnInit } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({
    templateUrl: 'add-edit.component.html',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, NgClass, RouterLink]
})
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    title!: string;
    loading = false;
    submitting = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.form = this.formBuilder.group({
          nombre: ['', Validators.required],
          correo: ['', Validators.required, Validators.email],
          password: ['', [Validators.minLength(6), ...(!this.id ? [Validators.required] : [])]],
          confirmPassword: ['', [Validators.minLength(6), ...(!this.id ? [Validators.required] : [])]],
          rol: ['', Validators.required],
          fechaAlta: [new Date().toLocaleDateString('es-MX')]
        });

        this.title = 'Agregar usuario';
        if (this.id) {
            this.title = 'Editar usuario';
            this.loading = true;
            this.accountService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.form.patchValue(x);
                    this.loading = false;
                });
        }
    }
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();
        if (this.form.invalid) {
            return;
        }

        this.submitting = true;
        this.saveUser()
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Usuario actualizado', true);
                    this.router.navigateByUrl('/users');
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            })
    }

    private saveUser() {
        return this.id
            ? this.accountService.update(this.id!, this.form.value)
            : this.accountService.register(this.form.value);
    }
}
