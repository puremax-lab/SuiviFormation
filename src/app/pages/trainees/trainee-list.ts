import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Trainee } from '../../core/models';
import { RoleService } from '../../core/role';
import { TrainingStore } from '../../core/training-store';
import { Rate } from '../../shared/rate';

@Component({
  selector: 'app-trainee-list',
  imports: [RouterLink, Rate],
  templateUrl: './trainee-list.html',
})
export class TraineeList {
  private readonly store = inject(TrainingStore);
  protected readonly isAdmin = inject(RoleService).isAdmin;
  protected readonly sessions = this.store.sessions;

  protected readonly search = signal('');
  protected readonly sessionId = signal('');

  protected readonly rows = computed(() => {
    const words = normalize(this.search()).split(' ').filter(Boolean);
    return this.store
      .trainees()
      .filter((t) => !this.sessionId() || t.sessionId === this.sessionId())
      .filter((t) => {
        const haystack = normalize(`${t.firstname} ${t.lastname} ${t.email}`);
        return words.every((word) => haystack.includes(word));
      })
      .map((trainee) => ({
        trainee,
        session: this.store.sessionById(trainee.sessionId),
        rate: this.store.traineeRate(trainee.id),
      }));
  });

  protected delete(trainee: Trainee): void {
    if (confirm(`Supprimer ${trainee.firstname} ${trainee.lastname} et ses présences ?`)) {
      this.store.deleteTrainee(trainee.id);
    }
  }
}

/** Lower case without accents, so "ines" finds "Inès". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}
