import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { isWeekend, today } from '../../core/dates';
import { TrainingStore } from '../../core/training-store';
import { Rate } from '../../shared/rate';

/** Threshold under which a trainee appears in the "to watch" list. */
const WATCH_THRESHOLD = 80;

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, Rate],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly store = inject(TrainingStore);

  protected readonly today = today();
  protected readonly isWeekend = isWeekend(this.today);
  protected readonly overallRate = this.store.overallRate;

  protected readonly ongoing = computed(() =>
    this.store
      .sessions()
      .filter((s) => this.store.sessionState(s, this.today) === 'ongoing')
      .map((session) => {
        const trainees = this.store.traineesOf(session.id);
        const marked = trainees.filter((t) => this.store.statusOf(t.id, this.today)).length;
        return { session, total: trainees.length, marked };
      }),
  );

  protected readonly upcoming = computed(() =>
    this.store.sessions().filter((s) => this.store.sessionState(s, this.today) === 'upcoming'),
  );

  protected readonly activeTrainees = computed(() =>
    this.ongoing().reduce((sum, item) => sum + item.total, 0),
  );

  protected readonly toTake = computed(() =>
    this.isWeekend ? 0 : this.ongoing().filter((item) => item.marked < item.total).length,
  );

  protected readonly toWatch = computed(() =>
    this.ongoing()
      .flatMap(({ session }) =>
        this.store.traineesOf(session.id).map((trainee) => ({
          trainee,
          session,
          rate: this.store.traineeRate(trainee.id),
        })),
      )
      .filter((item) => item.rate !== null && item.rate < WATCH_THRESHOLD)
      .sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0)),
  );

  protected readonly watchThreshold = WATCH_THRESHOLD;
}
