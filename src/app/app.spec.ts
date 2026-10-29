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

  it('links to the source code and the legal notice in the footer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links = [...fixture.nativeElement.querySelectorAll('.footer-links a')].map((a: Element) =>
      a.getAttribute('href'),
    );
    expect(links).toEqual([
      'https://github.com/puremax-lab/SuiviFormation',
      'https://github.com/puremax-lab',
      '/mentions-legales',
    ]);
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
