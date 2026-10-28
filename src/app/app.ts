import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Role } from './core/models';
import { RoleService } from './core/role';
import { TrainingStore } from './core/training-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  protected readonly roles = inject(RoleService);
  private readonly store = inject(TrainingStore);
  private readonly router = inject(Router);

  protected changeRole(role: Role): void {
    this.roles.setRole(role);
    // A trainer may not stay on a create or edit page.
    if (role === 'trainer' && /\/(nouvelle|nouveau|modifier)$/.test(this.router.url)) {
      this.router.navigate(['/']);
    }
  }

  protected resetDemo(): void {
    if (confirm('Remettre les données de démonstration ? Vos modifications seront perdues.')) {
      this.store.reset();
      this.router.navigate(['/']);
    }
  }
}
