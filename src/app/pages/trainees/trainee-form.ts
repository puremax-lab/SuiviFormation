import { Component, inject, input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TrainingStore } from '../../core/training-store';

/** Rejects an email already used by another trainee. */
export function uniqueEmail(store: TrainingStore, exceptId: () => string | undefined): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    control.value && store.isEmailTaken(control.value, exceptId()) ? { emailTaken: true } : null;
}

/** Creates a trainee, or edits it when the route has an id. */
@Component({
  selector: 'app-trainee-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './trainee-form.html',
})
export class TraineeForm implements OnInit {
  private readonly store = inject(TrainingStore);
  private readonly router = inject(Router);

  readonly id = input<string>();
  /** Optional ?session= query parameter, to preselect the session. */
  readonly session = input<string>();

  protected readonly sessions = this.store.sessions;
  protected readonly notFound = signal(false);
  private originalSessionId = '';

  protected readonly form = inject(NonNullableFormBuilder).group({
    firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email, uniqueEmail(this.store, () => this.id())]],
    sessionId: ['', Validators.required],
  });

  private readonly selectedSession = toSignal(this.form.controls.sessionId.valueChanges, {
    initialValue: '',
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      if (this.session() && this.store.sessionById(this.session()!)) {
        this.form.controls.sessionId.setValue(this.session()!);
      }
      return;
    }
    const trainee = this.store.traineeById(id);
    if (!trainee) {
      this.notFound.set(true);
      return;
    }
    this.originalSessionId = trainee.sessionId;
    this.form.setValue({
      firstname: trainee.firstname,
      lastname: trainee.lastname,
      email: trainee.email,
      sessionId: trainee.sessionId,
    });
  }

  /** True when editing and the session was changed: past attendance will be removed. */
  protected movesSession(): boolean {
    return !!this.originalSessionId && this.selectedSession() !== this.originalSessionId;
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();
    const trainee = {
      firstname: values.firstname.trim(),
      lastname: values.lastname.trim(),
      email: values.email.trim().toLowerCase(),
      sessionId: values.sessionId,
    };

    const id = this.id();
    if (id) {
      this.store.updateTrainee(id, trainee);
    } else {
      this.store.addTrainee(trainee);
    }
    this.router.navigate(['/stagiaires']);
  }
}
