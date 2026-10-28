import { Pipe, PipeTransform } from '@angular/core';
import { AttendanceStatus, SessionState } from '../core/models';

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Présent',
  late: 'En retard',
  absent: 'Absent',
};

const STATE_LABELS: Record<SessionState, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  finished: 'Terminée',
};

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: AttendanceStatus | null): string {
    return status ? STATUS_LABELS[status] : 'Non renseigné';
  }
}

@Pipe({ name: 'stateLabel' })
export class StateLabelPipe implements PipeTransform {
  transform(state: SessionState): string {
    return STATE_LABELS[state];
  }
}
