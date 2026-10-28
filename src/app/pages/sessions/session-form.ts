import { Component, inject, input, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TrainingStore } from '../../core/training-store';

/** Group validator: the end date may not be before the start date. */
export function datesInOrder(group: AbstractControl): ValidationErrors | null {
  const { startDate, endDate } = group.value as { startDate: string; endDate: string };
  return startDate && endDate && endDate < startDate ? { datesInOrder: true } : null;
}

/** Creates a session, or edits it when the route has an id. */
@Component({
  selector: 'app-session-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './session-form.html',
})
export class SessionForm implements OnInit {
  private readonly store = inject(TrainingStore);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly notFound = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      trainer: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    },
    { validators: datesInOrder },
  );

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      return;
    }
    const session = this.store.sessionById(id);
    if (session) {
      this.form.setValue({
        title: session.title,
        trainer: session.trainer,
        startDate: session.startDate,
        endDate: session.endDate,
      });
    } else {
      this.notFound.set(true);
    }
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
    values.title = values.title.trim();
    values.trainer = values.trainer.trim();

    const id = this.id();
    if (id) {
      this.store.updateSession(id, values);
      this.router.navigate(['/sessions', id]);
    } else {
      const session = this.store.addSession(values);
      this.router.navigate(['/sessions', session.id]);
    }
  }
}
