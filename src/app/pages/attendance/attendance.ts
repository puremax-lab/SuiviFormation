import { Component, computed, inject, input } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { addDays, isWeekend, today } from '../../core/dates';
import { AttendanceStatus } from '../../core/models';
import { TrainingStore } from '../../core/training-store';

/**
 * Taking attendance: one session, one day, one status per trainee.
 * The session and the day live in the URL (?session=…&date=…), so a page can be shared or bookmarked.
 */
@Component({
  selector: 'app-attendance',
  imports: [DatePipe, NgClass, RouterLink],
  templateUrl: './attendance.html',
})
export class Attendance {
  private readonly store = inject(TrainingStore);
  private readonly router = inject(Router);

  /** Query parameters, bound by withComponentInputBinding(). */
  readonly session = input<string>();
  readonly date = input<string>();

  protected readonly statuses: { value: AttendanceStatus; label: string }[] = [
    { value: 'present', label: 'Présent' },
    { value: 'late', label: 'Retard' },
    { value: 'absent', label: 'Absent' },
  ];

  protected readonly sessions = computed(() =>
    this.store.sessions().filter((s) => this.store.sessionState(s) !== 'upcoming'),
  );

  /** Session from the URL, otherwise the first ongoing one. */
  protected readonly current = computed(() => {
    const fromUrl = this.session() && this.store.sessionById(this.session()!);
    return (
      fromUrl ||
      this.sessions().find((s) => this.store.sessionState(s) === 'ongoing') ||
      this.sessions()[0]
    );
  });

  protected readonly day = computed(() => {
    const date = this.date();
    return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today();
  });

  protected readonly outOfRange = computed(() => {
    const session = this.current();
    return !!session && (this.day() < session.startDate || this.day() > session.endDate);
  });
  protected readonly weekend = computed(() => isWeekend(this.day()));
  protected readonly isFuture = computed(() => this.day() > today());

  protected readonly rows = computed(() => {
    const session = this.current();
    // Read attendance so the rows refresh after each click.
    this.store.attendance();
    return session
      ? this.store.traineesOf(session.id).map((trainee) => ({
          trainee,
          status: this.store.statusOf(trainee.id, this.day()),
        }))
      : [];
  });

  protected readonly summary = computed(() => {
    const rows = this.rows();
    const count = (status: AttendanceStatus | null) =>
      rows.filter((r) => r.status === status).length;
    return {
      present: count('present'),
      late: count('late'),
      absent: count('absent'),
      missing: count(null),
    };
  });

  protected select(params: { session?: string; date?: string }): void {
    this.router.navigate([], {
      queryParams: {
        session: params.session ?? this.current()?.id,
        date: params.date ?? this.day(),
      },
      replaceUrl: true,
    });
  }

  protected shiftDay(days: number): void {
    let day = addDays(this.day(), days);
    while (isWeekend(day)) {
      day = addDays(day, days);
    }
    this.select({ date: day });
  }

  /** Clicking the active status again clears it. */
  protected mark(
    traineeId: string,
    status: AttendanceStatus,
    current: AttendanceStatus | null,
  ): void {
    const session = this.current();
    if (session) {
      this.store.setStatus(session.id, traineeId, this.day(), current === status ? null : status);
    }
  }

  protected markAllPresent(): void {
    const session = this.current();
    if (session) {
      this.store.markAll(session.id, this.day(), 'present');
    }
  }
}
