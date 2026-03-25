// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

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


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'anmeldungen': {
    'kurs': 'applookup/select',
    'teilnehmer': 'applookup/select',
    'anmeldedatum': 'date/date',
    'bezahlt': 'bool',
  },
  'kurse': {
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'startdatum': 'date/date',
    'enddatum': 'date/date',
    'max_teilnehmer': 'number',
    'preis': 'number',
    'dozent': 'applookup/select',
    'raum': 'applookup/select',
  },
  'raeume': {
    'raumname': 'string/text',
    'gebaeude': 'string/text',
    'kapazitaet': 'number',
  },
  'teilnehmer': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'geburtsdatum': 'date/date',
  },
  'dozenten': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'fachgebiet': 'string/text',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateAnmeldungen = StripLookup<Anmeldungen['fields']>;
export type CreateKurse = StripLookup<Kurse['fields']>;
export type CreateRaeume = StripLookup<Raeume['fields']>;
export type CreateTeilnehmer = StripLookup<Teilnehmer['fields']>;
export type CreateDozenten = StripLookup<Dozenten['fields']>;