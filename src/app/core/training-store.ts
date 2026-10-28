import { computed, Injectable, signal } from '@angular/core';
import { today } from './dates';
import { createDemoData, TrainingData } from './demo-data';
import { AttendanceRecord, AttendanceStatus, Session, SessionState, Trainee } from './models';

export const STORAGE_KEY = 'suivi-formation:data';

/**
 * Single source of truth for sessions, trainees and attendance.
 * State lives in signals and is saved to localStorage after every change,
 * so the app works without a back end.
 */
@Injectable({ providedIn: 'root' })
export class TrainingStore {
  private readonly data = signal<TrainingData>(this.load());

  readonly sessions = computed(() =>
    [...this.data().sessions].sort((a, b) => a.startDate.localeCompare(b.startDate)),
  );
  readonly trainees = computed(() =>
    [...this.data().trainees].sort(
      (a, b) => a.lastname.localeCompare(b.lastname) || a.firstname.localeCompare(b.firstname),
    ),
  );
  readonly attendance = computed(() => this.data().attendance);
  readonly overallRate = computed(() => attendanceRate(this.attendance()));

  // --- Sessions ---

  sessionById(id: string): Session | undefined {
    return this.data().sessions.find((s) => s.id === id);
  }

  sessionState(session: Session, now = today()): SessionState {
    if (now < session.startDate) {
      return 'upcoming';
    }
    return now > session.endDate ? 'finished' : 'ongoing';
  }

  addSession(values: Omit<Session, 'id'>): Session {
    const session = { ...values, id: newId() };
    this.update((data) => ({ ...data, sessions: [...data.sessions, session] }));
    return session;
  }

  updateSession(id: string, values: Omit<Session, 'id'>): void {
    this.update((data) => ({
      ...data,
      sessions: data.sessions.map((s) => (s.id === id ? { ...values, id } : s)),
    }));
  }

  /** Deletes the session with its trainees and their attendance. */
  deleteSession(id: string): void {
    this.update((data) => ({
      sessions: data.sessions.filter((s) => s.id !== id),
      trainees: data.trainees.filter((t) => t.sessionId !== id),
      attendance: data.attendance.filter((r) => r.sessionId !== id),
    }));
  }

  // --- Trainees ---

  traineeById(id: string): Trainee | undefined {
    return this.data().trainees.find((t) => t.id === id);
  }

  traineesOf(sessionId: string): Trainee[] {
    return this.trainees().filter((t) => t.sessionId === sessionId);
  }

  isEmailTaken(email: string, exceptId?: string): boolean {
    const wanted = email.trim().toLowerCase();
    return this.data().trainees.some((t) => t.id !== exceptId && t.email.toLowerCase() === wanted);
  }

  addTrainee(values: Omit<Trainee, 'id'>): Trainee {
    const trainee = { ...values, id: newId() };
    this.update((data) => ({ ...data, trainees: [...data.trainees, trainee] }));
    return trainee;
  }

  /** Moving a trainee to another session drops the attendance of the old one. */
  updateTrainee(id: string, values: Omit<Trainee, 'id'>): void {
    this.update((data) => ({
      ...data,
      trainees: data.trainees.map((t) => (t.id === id ? { ...values, id } : t)),
      attendance: data.attendance.filter(
        (r) => r.traineeId !== id || r.sessionId === values.sessionId,
      ),
    }));
  }

  deleteTrainee(id: string): void {
    this.update((data) => ({
      ...data,
      trainees: data.trainees.filter((t) => t.id !== id),
      attendance: data.attendance.filter((r) => r.traineeId !== id),
    }));
  }

  // --- Attendance ---

  statusOf(traineeId: string, date: string): AttendanceStatus | null {
    return (
      this.data().attendance.find((r) => r.traineeId === traineeId && r.date === date)?.status ??
      null
    );
  }

  /** Sets, changes or (with null) clears the status of one trainee on one day. */
  setStatus(
    sessionId: string,
    traineeId: string,
    date: string,
    status: AttendanceStatus | null,
  ): void {
    this.update((data) => {
      const others = data.attendance.filter((r) => !(r.traineeId === traineeId && r.date === date));
      return {
        ...data,
        attendance: status ? [...others, { sessionId, traineeId, date, status }] : others,
      };
    });
  }

  /** Gives the same status to every trainee of a session on one day. */
  markAll(sessionId: string, date: string, status: AttendanceStatus): void {
    const ids = new Set(this.traineesOf(sessionId).map((t) => t.id));
    this.update((data) => ({
      ...data,
      attendance: [
        ...data.attendance.filter((r) => !(ids.has(r.traineeId) && r.date === date)),
        ...[...ids].map((traineeId) => ({ sessionId, traineeId, date, status })),
      ],
    }));
  }

  traineeRate(traineeId: string): number | null {
    return attendanceRate(this.attendance().filter((r) => r.traineeId === traineeId));
  }

  sessionRate(sessionId: string): number | null {
    return attendanceRate(this.attendance().filter((r) => r.sessionId === sessionId));
  }

  // --- Storage ---

  /** Puts the demo data back. */
  reset(): void {
    this.update(() => createDemoData());
  }

  private update(change: (data: TrainingData) => TrainingData): void {
    this.data.update(change);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data()));
    } catch {
      // Storage full or blocked: the app keeps working for this visit.
    }
  }

  private load(): TrainingData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as TrainingData;
      }
    } catch {
      // Unreadable or blocked storage: start again from the demo data.
    }
    return createDemoData();
  }
}

/**
 * Share of days attended, from 0 to 100. Being late counts as attended.
 * Returns null when nothing has been recorded yet.
 */
export function attendanceRate(records: AttendanceRecord[]): number | null {
  if (records.length === 0) {
    return null;
  }
  const attended = records.filter((r) => r.status !== 'absent').length;
  return Math.round((attended / records.length) * 100);
}

function newId(): string {
  return crypto.randomUUID();
}
