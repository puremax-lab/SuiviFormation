import { TestBed } from '@angular/core/testing';
import { today } from './dates';
import { attendanceRate, STORAGE_KEY, TrainingStore } from './training-store';

describe('TrainingStore', () => {
  let store: TrainingStore;

  beforeEach(() => {
    localStorage.clear();
    store = TestBed.inject(TrainingStore);
  });

  it('starts with the demo data: one ongoing, one finished and one upcoming session', () => {
    const states = store.sessions().map((s) => store.sessionState(s));
    expect(states.sort()).toEqual(['finished', 'ongoing', 'upcoming']);
    expect(store.trainees().length).toBe(17);
  });

  it('leaves today empty in the demo data', () => {
    expect(store.attendance().some((r) => r.date === today())).toBe(false);
  });

  it('computes the state of a session from its dates', () => {
    const session = {
      id: 'x',
      title: 'X',
      trainer: 'Y',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    };
    expect(store.sessionState(session, '2026-02-28')).toBe('upcoming');
    expect(store.sessionState(session, '2026-03-01')).toBe('ongoing');
    expect(store.sessionState(session, '2026-03-31')).toBe('ongoing');
    expect(store.sessionState(session, '2026-04-01')).toBe('finished');
  });

  it('sets, changes and clears a status', () => {
    store.setStatus('s1', 't1', '2030-01-07', 'present');
    expect(store.statusOf('t1', '2030-01-07')).toBe('present');

    store.setStatus('s1', 't1', '2030-01-07', 'late');
    expect(store.statusOf('t1', '2030-01-07')).toBe('late');
    expect(store.attendance().filter((r) => r.date === '2030-01-07').length).toBe(1);

    store.setStatus('s1', 't1', '2030-01-07', null);
    expect(store.statusOf('t1', '2030-01-07')).toBeNull();
  });

  it('marks every trainee of a session at once', () => {
    store.markAll('s1', '2030-01-07', 'present');
    const marked = store.attendance().filter((r) => r.date === '2030-01-07');
    expect(marked.length).toBe(store.traineesOf('s1').length);
    expect(marked.every((r) => r.status === 'present')).toBe(true);
  });

  it('deletes a trainee with their attendance', () => {
    store.deleteTrainee('t1');
    expect(store.traineeById('t1')).toBeUndefined();
    expect(store.attendance().some((r) => r.traineeId === 't1')).toBe(false);
  });

  it('drops the old attendance when a trainee changes session', () => {
    const trainee = store.traineeById('t1')!;
    store.updateTrainee('t1', { ...trainee, sessionId: 's3' });
    expect(store.traineeById('t1')?.sessionId).toBe('s3');
    expect(store.attendance().some((r) => r.traineeId === 't1')).toBe(false);
  });

  it('keeps the attendance when only the name changes', () => {
    const before = store.attendance().filter((r) => r.traineeId === 't1').length;
    const trainee = store.traineeById('t1')!;
    store.updateTrainee('t1', { ...trainee, firstname: 'Sara' });
    expect(store.attendance().filter((r) => r.traineeId === 't1').length).toBe(before);
  });

  it('deletes a session with its trainees and attendance', () => {
    store.deleteSession('s2');
    expect(store.sessionById('s2')).toBeUndefined();
    expect(store.traineesOf('s2')).toEqual([]);
    expect(store.attendance().some((r) => r.sessionId === 's2')).toBe(false);
  });

  it('checks emails without case and ignores the trainee being edited', () => {
    expect(store.isEmailTaken('SARAH.JANSSENS@exemple.be')).toBe(true);
    expect(store.isEmailTaken('sarah.janssens@exemple.be', 't1')).toBe(false);
    expect(store.isEmailTaken('nobody@exemple.be')).toBe(false);
  });

  it('saves changes to localStorage and reads them back', () => {
    const session = store.addSession({
      title: 'Docker',
      trainer: 'Jean Noël',
      startDate: '2030-01-01',
      endDate: '2030-02-01',
    });
    expect(localStorage.getItem(STORAGE_KEY)).toContain('Docker');

    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(TrainingStore);
    expect(reloaded.sessionById(session.id)?.title).toBe('Docker');
  });

  it('falls back to the demo data when the saved data is broken', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    TestBed.resetTestingModule();
    expect(TestBed.inject(TrainingStore).sessions().length).toBe(3);
  });

  it('puts the demo data back on reset', () => {
    store.deleteSession('s1');
    store.reset();
    expect(store.sessionById('s1')).toBeDefined();
  });
});

describe('attendanceRate', () => {
  const record = (status: 'present' | 'late' | 'absent') => ({
    sessionId: 's',
    traineeId: 't',
    date: '2030-01-01',
    status,
  });

  it('returns null when nothing is recorded', () => {
    expect(attendanceRate([])).toBeNull();
  });

  it('counts late as attended and rounds the result', () => {
    expect(attendanceRate([record('present'), record('late'), record('absent')])).toBe(67);
  });
});
