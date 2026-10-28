import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { RoleService } from './core/role';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('shows the main navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links = [...fixture.nativeElement.querySelectorAll('.main-nav a')].map((a: Element) =>
      a.textContent?.trim(),
    );
    expect(links).toEqual(['Tableau de bordAccueil', 'Sessions', 'Stagiaires', 'Présences']);
  });

  it('shows the reset link to admins only', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const resetLink = () => fixture.nativeElement.querySelector('.footer .link-button');
    expect(resetLink()).not.toBeNull();

    TestBed.inject(RoleService).setRole('trainer');
    await fixture.whenStable();
    expect(resetLink()).toBeNull();
  });
});
