import { FormControl, FormGroup } from '@angular/forms';
import { datesInOrder } from './session-form';

describe('datesInOrder', () => {
  const group = (startDate: string, endDate: string) =>
    new FormGroup({ startDate: new FormControl(startDate), endDate: new FormControl(endDate) });

  it('accepts an end date on or after the start date', () => {
    expect(datesInOrder(group('2030-01-01', '2030-01-01'))).toBeNull();
    expect(datesInOrder(group('2030-01-01', '2030-02-01'))).toBeNull();
  });

  it('rejects an end date before the start date', () => {
    expect(datesInOrder(group('2030-02-01', '2030-01-01'))).toEqual({ datesInOrder: true });
  });

  it('waits until both dates are filled', () => {
    expect(datesInOrder(group('2030-02-01', ''))).toBeNull();
  });
});
