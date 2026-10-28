import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { parseIsoDate, today } from '../../core/dates';
import { Session, SessionState } from '../../core/models';
import { RoleService } from '../../core/role';
import { TrainingStore } from '../../core/training-store';
import { StateLabelPipe } from '../../shared/labels';
import { Rate } from '../../shared/rate';

type Filter = SessionState | 'all';

@Component({
  selector: 'app-session-list',
  imports: [RouterLink, DatePipe, Rate, StateLabelPipe],
  templateUrl: './session-list.html',
})
export class SessionList {
  private readonly store = inject(TrainingStore);
  protected readonly isAdmin = inject(RoleService).isAdmin;

  protected readonly filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Toutes' },
    { value: 'ongoing', label: 'En cours' },
    { value: 'upcoming', label: 'À venir' },
    { value: 'finished', label: 'Terminées' },
  ];
  protected readonly filter = signal<Filter>('all');

  protected readonly cards = computed(() =>
    this.store
      .sessions()
      .map((session) => ({
        session,
        state: this.store.sessionState(session),
        trainees: this.store.traineesOf(session.id).length,
        rate: this.store.sessionRate(session.id),
        progress: progress(session),
      }))
      .filter((card) => this.filter() === 'all' || card.state === this.filter()),
  );
}

/** Share of the session already elapsed, from 0 to 100. */
function progress(session: Session): number {
  const start = parseIsoDate(session.startDate).getTime();
  const end = parseIsoDate(session.endDate).getTime();
  const now = parseIsoDate(today()).getTime();
  if (end <= start) {
    return now >= end ? 100 : 0;
  }
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}
