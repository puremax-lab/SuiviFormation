import { addDays, today, weekdaysBetween } from './dates';
import { AttendanceRecord, AttendanceStatus, Session, Trainee } from './models';

export interface TrainingData {
  sessions: Session[];
  trainees: Trainee[];
  attendance: AttendanceRecord[];
}

/**
 * Demo data with dates relative to today, so the demo always shows
 * one ongoing, one finished and one upcoming session.
 */
export function createDemoData(now = today()): TrainingData {
  const sessions: Session[] = [
    {
      id: 's1',
      title: 'Développeur web full stack',
      trainer: 'Julien Mercier',
      startDate: addDays(now, -25),
      endDate: addDays(now, 60),
    },
    {
      id: 's2',
      title: 'Angular : les fondamentaux',
      trainer: 'Charles Dubois',
      startDate: addDays(now, -70),
      endDate: addDays(now, -10),
    },
    {
      id: 's3',
      title: 'Bases de données SQL',
      trainer: 'Pierre Lemaire',
      startDate: addDays(now, 14),
      endDate: addDays(now, 45),
    },
  ];

  const people: [string, string, string][] = [
    ['Sarah', 'Janssens', 's1'],
    ['Mehdi', 'El Amrani', 's1'],
    ['Lucie', 'Peeters', 's1'],
    ['Thomas', 'Maes', 's1'],
    ['Inès', 'Lambert', 's1'],
    ['Yann', 'Dupont', 's1'],
    ['Amina', 'Diallo', 's1'],
    ['Hugo', 'Willems', 's1'],
    ['Emma', 'Claes', 's2'],
    ['Nathan', 'Goossens', 's2'],
    ['Chloé', 'Martin', 's2'],
    ['Karim', 'Benali', 's2'],
    ['Julie', 'Wouters', 's2'],
    ['Lina', 'Hermans', 's3'],
    ['Maxime', 'Simon', 's3'],
    ['Zoé', 'Leroy', 's3'],
    ['Adam', 'Michel', 's3'],
  ];

  const trainees: Trainee[] = people.map(([firstname, lastname, sessionId], index) => ({
    id: `t${index + 1}`,
    firstname,
    lastname,
    email: `${slug(firstname)}.${slug(lastname)}@exemple.be`,
    sessionId,
  }));

  // Past weekdays only: today is left empty so the demo user can take attendance.
  const attendance: AttendanceRecord[] = [];
  for (const session of sessions) {
    const lastDay = session.endDate < now ? session.endDate : addDays(now, -1);
    for (const date of weekdaysBetween(session.startDate, lastDay)) {
      for (const trainee of trainees.filter((t) => t.sessionId === session.id)) {
        attendance.push({
          sessionId: session.id,
          traineeId: trainee.id,
          date,
          status: demoStatus(trainee.id, date),
        });
      }
    }
  }

  return { sessions, trainees, attendance };
}

/** Repeatable "random" status, with two trainees who are often absent. */
function demoStatus(traineeId: string, date: string): AttendanceStatus {
  // FNV-1a hash, reduced to 0-999.
  let hash = 0x811c9dc5;
  for (const char of traineeId + date) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193) >>> 0;
  }
  hash %= 1000;
  const absentChance = traineeId === 't4' || traineeId === 't11' ? 300 : 60;
  if (hash < absentChance) {
    return 'absent';
  }
  return hash < absentChance + 70 ? 'late' : 'present';
}

function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
}
