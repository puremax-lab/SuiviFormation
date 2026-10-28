import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="empty-state">
      <p class="empty-code">404</p>
      <h1>Page introuvable</h1>
      <p class="muted">Cette page n'existe pas ou a été supprimée.</p>
      <a routerLink="/" class="btn">Retour au tableau de bord</a>
    </div>
  `,
})
export class NotFound {}
