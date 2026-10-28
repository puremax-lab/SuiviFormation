import { addDays, isWeekend, toIsoDate, weekdaysBetween } from './dates';

describe('dates', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('adds days across months and years', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('detects weekends', () => {
    expect(isWeekend('2026-10-31')).toBe(true); // Saturday
    expect(isWeekend('2026-11-01')).toBe(true); // Sunday
    expect(isWeekend('2026-11-02')).toBe(false); // Monday
  });

  it('lists the weekdays between two dates, both included', () => {
    expect(weekdaysBetween('2026-10-30', '2026-11-03')).toEqual([
      '2026-10-30',
      '2026-11-02',
      '2026-11-03',
    ]);
  });
});
