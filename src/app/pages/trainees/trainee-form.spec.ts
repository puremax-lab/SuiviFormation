import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TrainingStore } from '../../core/training-store';
import { TraineeForm } from './trainee-form';

describe('TraineeForm', () => {
  let store: TrainingStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    store = TestBed.inject(TrainingStore);
  });

  async function render(inputs: { id?: string; session?: string } = {}) {
    const fixture = TestBed.createComponent(TraineeForm);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const fill = (id: string, value: string) => {
      const input = element.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input'));
    };
    const submit = async () => {
      element.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, element, fill, submit };
  }

  it('shows errors and saves nothing when the form is empty', async () => {
    const count = store.trainees().length;
    const { element, submit } = await render();
    await submit();
    expect(element.querySelectorAll('.error').length).toBe(4);
    expect(store.trainees().length).toBe(count);
  });

  it('refuses an email already used by another trainee', async () => {
    const { element, fill, submit } = await render({ session: 's1' });
    fill('firstname', 'Anna');
    fill('lastname', 'Vermeulen');
    fill('email', 'Sarah.Janssens@exemple.be');
    await submit();
    expect(element.textContent).toContain('déjà utilisé');
  });

  it('adds a valid trainee and goes back to the list', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { fill, submit } = await render({ session: 's3' });
    fill('firstname', ' Anna ');
    fill('lastname', 'Vermeulen');
    fill('email', 'Anna.Vermeulen@exemple.be');
    await submit();

    const added = store.trainees().find((t) => t.lastname === 'Vermeulen');
    expect(added).toMatchObject({
      firstname: 'Anna',
      email: 'anna.vermeulen@exemple.be',
      sessionId: 's3',
    });
    expect(navigate).toHaveBeenCalledWith(['/stagiaires']);
  });

  it('fills the form when editing and warns before a change of session', async () => {
    const { fixture, element, fill } = await render({ id: 't1' });
    expect(element.querySelector<HTMLInputElement>('#lastname')!.value).toBe('Janssens');
    expect(element.querySelector('.warning')).toBeNull();

    fill('sessionId', 's3');
    await fixture.whenStable();
    expect(element.querySelector('.warning')?.textContent).toContain('seront supprimées');
  });
});
