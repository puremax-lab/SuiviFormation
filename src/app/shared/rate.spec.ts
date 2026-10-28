import { TestBed } from '@angular/core/testing';
import { Rate } from './rate';

describe('Rate', () => {
  async function render(value: number | null): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(Rate);
    fixture.componentRef.setInput('value', value);
    await fixture.whenStable();
    return fixture.nativeElement.querySelector('.rate');
  }

  it('shows a green pill from 90 %', async () => {
    const pill = await render(90);
    expect(pill.textContent).toBe('90 %');
    expect(pill.classList).toContain('rate-good');
  });

  it('shows an orange pill from 75 % and a red one below', async () => {
    expect((await render(75)).classList).toContain('rate-warn');
    expect((await render(74)).classList).toContain('rate-bad');
  });

  it('shows a dash when there is no data', async () => {
    const pill = await render(null);
    expect(pill.textContent).toBe('—');
    expect(pill.classList).toContain('rate-none');
  });
});
