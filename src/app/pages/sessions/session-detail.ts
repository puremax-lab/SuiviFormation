import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { today } from '../../core/dates';
import { RoleService } from '../../core/role';
import { TrainingStore } from '../../core/training-store';
import { StateLabelPipe } from '../../shared/labels';
import { Rate } from '../../shared/rate';

@Component({
  selector: 'app-session-detail',
  imports: [RouterLink, DatePipe, Rate, StateLabelPipe],
  templateUrl: './session-detail.html',
})
export class SessionDetail {
  private readonly store = inject(TrainingStore);
  private readonly router = inject(Router);
  protected readonly isAdmin = inject(RoleService).isAdmin;

  /** Route parameter, bound by withComponentInputBinding(). */
  readonly id = input.required<string>();

  protected readonly today = today();

  protected readonly session = computed(() => {
    // Read the data signal so the page refreshes after a change.
    this.store.sessions();
    return this.store.sessionById(this.id());
  });

  protected readonly state = computed(() => {
    const session = this.session();
    return session ? this.store.sessionState(session) : null;
  });

  protected readonly rate = computed(() => this.store.sessionRate(this.id()));

  protected readonly rows = computed(() => {
    const records = this.store.attendance();
    return this.store.traineesOf(this.id()).map((trainee) => {
      const own = records.filter((r) => r.traineeId === trainee.id);
      return {
        trainee,
        rate: this.store.traineeRate(trainee.id),
        late: own.filter((r) => r.status === 'late').length,
        absent: own.filter((r) => r.status === 'absent').length,
      };
    });
  });

  protected delete(): void {
    const session = this.session();
    if (!session) {
      return;
    }
    const count = this.rows().length;
    const message =
      count > 0
        ? `Supprimer « ${session.title} » ? Ses ${count} stagiaires et leurs présences seront aussi supprimés.`
        : `Supprimer « ${session.title} » ?`;
    if (confirm(message)) {
      this.store.deleteSession(session.id);
      this.router.navigate(['/sessions']);
    }
  }
}
