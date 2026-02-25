// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Anmeldungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kurs?: string; // applookup -> URL zu 'Kurse' Record
    teilnehmer?: string; // applookup -> URL zu 'Teilnehmer' Record
    anmeldedatum?: string; // Format: YYYY-MM-DD oder ISO String
    bezahlt?: boolean;
  };
}

export interface Kurse {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    beschreibung?: string;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    enddatum?: string; // Format: YYYY-MM-DD oder ISO String
    max_teilnehmer?: number;
    preis?: number;
    dozent?: string; // applookup -> URL zu 'Dozenten' Record
    raum?: string; // applookup -> URL zu 'Raeume' Record
  };
}

export interface Raeume {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    raumname?: string;
    gebaeude?: string;
    kapazitaet?: number;
  };
}

export interface Teilnehmer {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    geburtsdatum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Dozenten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    fachgebiet?: string;
  };
}

export const APP_IDS = {
  ANMELDUNGEN: '699ee3e22aa88b70633078b7',
  KURSE: '699ee3e112521d4170b13729',
  RAEUME: '699ee3e02163d9e789db68d8',
  TEILNEHMER: '699ee3e1c832fec5bc59278c',
  DOZENTEN: '699ee3d900d22745910618f9',
} as const;

// Helper Types for creating new records
export type CreateAnmeldungen = Anmeldungen['fields'];
export type CreateKurse = Kurse['fields'];
export type CreateRaeume = Raeume['fields'];
export type CreateTeilnehmer = Teilnehmer['fields'];
export type CreateDozenten = Dozenten['fields'];