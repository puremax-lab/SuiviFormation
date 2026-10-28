/** A training course, run by one trainer between two dates. */
export interface Session {
  id: string;
  title: string;
  trainer: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

/** A person following one session. */
export interface Trainee {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  sessionId: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent';

/** Attendance of one trainee on one day. */
export interface AttendanceRecord {
  sessionId: string;
  traineeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export type SessionState = 'upcoming' | 'ongoing' | 'finished';

export type Role = 'admin' | 'trainer';
