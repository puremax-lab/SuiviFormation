import { CanActivateFn, Router } from '@angular/router';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Role } from './models';

const ROLE_KEY = 'suivi-formation:role';

/**
 * Current role, chosen in the header. There is no real login: the switch lets
 * visitors see what an admin and a trainer can each do.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  readonly role = signal<Role>(readRole());
  readonly isAdmin = computed(() => this.role() === 'admin');

  setRole(role: Role): void {
    this.role.set(role);
    try {
      localStorage.setItem(ROLE_KEY, role);
    } catch {
      // Not saved, but still applied for this visit.
    }
  }
}

/** Keeps trainers away from the pages that create or edit data. */
export const adminGuard: CanActivateFn = () =>
  inject(RoleService).isAdmin() || inject(Router).createUrlTree(['/']);

function readRole(): Role {
  try {
    return localStorage.getItem(ROLE_KEY) === 'trainer' ? 'trainer' : 'admin';
  } catch {
    return 'admin';
  }
}
