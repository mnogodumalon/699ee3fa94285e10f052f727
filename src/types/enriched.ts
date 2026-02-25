import type { Anmeldungen, Kurse } from './app';

export type EnrichedAnmeldungen = Anmeldungen & {
  kursName: string;
  teilnehmerName: string;
};

export type EnrichedKurse = Kurse & {
  dozentName: string;
  raumName: string;
};
