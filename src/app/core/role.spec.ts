import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { adminGuard, RoleService } from './role';

describe('RoleService and adminGuard', () => {
  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
  });

  it('starts as admin and lets the admin through', () => {
    expect(TestBed.inject(RoleService).isAdmin()).toBe(true);
    expect(runGuard()).toBe(true);
  });

  it('sends a trainer back to the dashboard', () => {
    TestBed.inject(RoleService).setRole('trainer');
    const result = runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
  });

  it('remembers the chosen role', () => {
    TestBed.inject(RoleService).setRole('trainer');
    TestBed.resetTestingModule();
    expect(TestBed.inject(RoleService).role()).toBe('trainer');
  });
});
