import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { addDays, isWeekend, today } from '../../core/dates';
import { TrainingStore } from '../../core/training-store';
import { Attendance } from './attendance';

/** Last weekday before today, inside the ongoing demo session. */
function lastWeekday(): string {
  let day = addDays(today(), -1);
  while (isWeekend(day)) {
    day = addDays(day, -1);
  }
  return day;
}

describe('Attendance', () => {
  let store: TrainingStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    store = TestBed.inject(TrainingStore);
  });

  async function render(date: string) {
    const fixture = TestBed.createComponent(Attendance);
    fixture.componentRef.setInput('session', 's1');
    fixture.componentRef.setInput('date', date);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('lists the trainees of the session with their status', async () => {
    const { element } = await render(lastWeekday());
    expect(element.querySelectorAll('.attendance-row').length).toBe(store.traineesOf('s1').length);
  });

  it('saves a status on click and clears it on a second click', async () => {
    const day = lastWeekday();
    store.setStatus('s1', 't1', day, 'present');
    const { fixture, element } = await render(day);
    const absent = () =>
      [...element.querySelectorAll<HTMLButtonElement>('.attendance-row')]
        .find((row) => row.textContent?.includes('Sarah Janssens'))!
        .querySelector<HTMLButtonElement>('button.status-absent')!;

    absent().click();
    await fixture.whenStable();
    expect(store.statusOf('t1', day)).toBe('absent');
    expect(absent().getAttribute('aria-pressed')).toBe('true');

    absent().click();
    await fixture.whenStable();
    expect(store.statusOf('t1', day)).toBeNull();
  });

  it('does not allow taking attendance on a future day', async () => {
    const { element } = await render(addDays(today(), 7));
    expect(element.querySelector('.attendance-row')).toBeNull();
    expect(element.querySelector('.notice')).not.toBeNull();
  });
});
