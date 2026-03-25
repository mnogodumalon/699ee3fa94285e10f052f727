/**
 * AI feature toggles per entity.
 * Set to true to show "Foto scannen" button in the create/edit dialog.
 * The agent can change these values — all other AI files are pre-generated.
 */

export const AI_PHOTO_SCAN: Record<string, boolean> = {
  Anmeldungen: true,
  Kurse: true,
  Raeume: true,
  Teilnehmer: true,
  Dozenten: true,
};

export const AI_PHOTO_LOCATION: Record<string, boolean> = {
  Anmeldungen: false,
  Kurse: false,
  Raeume: false,
  Teilnehmer: false,
  Dozenten: false,
};