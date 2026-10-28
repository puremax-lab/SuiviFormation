import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

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
});
