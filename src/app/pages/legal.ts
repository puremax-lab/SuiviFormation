import { Component } from '@angular/core';

@Component({
  selector: 'app-legal',
  template: `
    <article class="legal">
      <h1>Mentions légales</h1>
      <p class="muted">
        SuiviFormation est un projet de portfolio : une application de démonstration, sans but commercial.
      </p>

      <h2>Éditeur</h2>
      <p>
        puremax-lab, développeur web (particulier).<br />
        Contact : <a href="https://github.com/puremax-lab" target="_blank" rel="noopener">github.com/puremax-lab</a>
      </p>

      <h2>Hébergeur</h2>
      <p>
        GitHub Pages, service de GitHub, Inc.<br />
        88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis
      </p>

      <h2>Données personnelles</h2>
      <p>
        L'application n'a pas de serveur : les sessions, stagiaires et présences que vous saisissez restent dans
        votre navigateur (stockage local). Rien n'est envoyé ni collecté, et aucun cookie n'est utilisé. Le lien
        « Réinitialiser la démo » efface vos modifications.
      </p>
    </article>
  `,
})
export class Legal {}
