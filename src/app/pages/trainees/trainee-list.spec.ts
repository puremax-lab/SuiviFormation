import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RoleService } from '../../core/role';
import { TraineeList } from './trainee-list';

describe('TraineeList', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  async function render() {
    const fixture = TestBed.createComponent(TraineeList);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const names = () =>
      [...element.querySelectorAll('tbody td:first-child .strong')].map((e) => e.textContent);
    const search = async (text: string) => {
      const input = element.querySelector<HTMLInputElement>('input[type="search"]')!;
      input.value = text;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    return { fixture, element, names, search };
  }

  it('finds a trainee without typing the accents', async () => {
    const { names, search } = await render();
    await search('ines');
    expect(names()).toEqual(['Inès Lambert']);
  });

  it('filters by session', async () => {
    const { fixture, element, names } = await render();
    const select = element.querySelector<HTMLSelectElement>('select')!;
    select.value = 's3';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(names().length).toBe(4);
  });

  it('hides the edit and delete buttons from trainers', async () => {
    TestBed.inject(RoleService).setRole('trainer');
    const { element } = await render();
    expect(element.querySelector('.icon-button')).toBeNull();
  });
});
