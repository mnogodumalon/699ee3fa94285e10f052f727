import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichAnmeldungen, enrichKurse } from '@/lib/enrich';
import type { EnrichedKurse } from '@/types/enriched';
import type { Kurse, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { AI_PHOTO_SCAN } from '@/config/ai-features';
import { Skeleton } from '@/components/ui/skeleton';
import { IconAlertCircle, IconPlus, IconUsers, IconBook, IconCurrencyEuro, IconMapPin, IconSchool, IconChevronRight, IconCircleCheck, IconCircleX, IconPencil, IconTrash, IconUserPlus, IconCalendar } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { KurseDialog } from '@/components/dialogs/KurseDialog';
import { AnmeldungenDialog } from '@/components/dialogs/AnmeldungenDialog';

export default function DashboardOverview() {
  const {
    anmeldungen, kurse, raeume, teilnehmer, dozenten,
    kurseMap, raeumeMap, teilnehmerMap, dozentenMap,
    loading, error, fetchAll,
  } = useDashboardData();

  const [selectedKursId, setSelectedKursId] = useState<string | null>(null);
  const [kursDialogOpen, setKursDialogOpen] = useState(false);
  const [editKurs, setEditKurs] = useState<Kurse | null>(null);
  const [deleteKursTarget, setDeleteKursTarget] = useState<Kurse | null>(null);

  const [anmeldungDialogOpen, setAnmeldungDialogOpen] = useState(false);
  const [editAnmeldung, setEditAnmeldung] = useState<Anmeldungen | null>(null);
  const [deleteAnmeldungTarget, setDeleteAnmeldungTarget] = useState<Anmeldungen | null>(null);

  const enrichedKurse = useMemo(
    () => enrichKurse(kurse, { dozentenMap, raeumeMap }),
    [kurse, dozentenMap, raeumeMap]
  );

  const enrichedAnmeldungen = useMemo(
    () => enrichAnmeldungen(anmeldungen, { kurseMap, teilnehmerMap }),
    [anmeldungen, kurseMap, teilnehmerMap]
  );

  const selectedKurs = useMemo(
    () => selectedKursId ? enrichedKurse.find(k => k.record_id === selectedKursId) ?? null : null,
    [selectedKursId, enrichedKurse]
  );

  const kursAnmeldungen = useMemo(
    () => enrichedAnmeldungen.filter(a => {
      const id = extractRecordId(a.fields.kurs);
      return id === selectedKursId;
    }),
    [selectedKursId, enrichedAnmeldungen]
  );

  const anmeldungenByKurs = useMemo(() => {
    const map = new Map<string, number>();
    anmeldungen.forEach(a => {
      const id = extractRecordId(a.fields.kurs);
      if (id) map.set(id, (map.get(id) ?? 0) + 1);
    });
    return map;
  }, [anmeldungen]);

  const bezahltCount = useMemo(
    () => anmeldungen.filter(a => a.fields.bezahlt).length,
    [anmeldungen]
  );

  const umsatz = useMemo(() => {
    let total = 0;
    anmeldungen.forEach(a => {
      if (!a.fields.bezahlt) return;
      const id = extractRecordId(a.fields.kurs);
      if (!id) return;
      const kurs = kurseMap.get(id);
      if (kurs?.fields.preis) total += kurs.fields.preis;
    });
    return total;
  }, [anmeldungen, kurseMap]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  const handleDeleteKurs = async () => {
    if (!deleteKursTarget) return;
    await LivingAppsService.deleteKurseEntry(deleteKursTarget.record_id);
    if (selectedKursId === deleteKursTarget.record_id) setSelectedKursId(null);
    setDeleteKursTarget(null);
    fetchAll();
  };

  const handleDeleteAnmeldung = async () => {
    if (!deleteAnmeldungTarget) return;
    await LivingAppsService.deleteAnmeldungenEntry(deleteAnmeldungTarget.record_id);
    setDeleteAnmeldungTarget(null);
    fetchAll();
  };

  const getAuslastung = (kurs: EnrichedKurse) => {
    const count = anmeldungenByKurs.get(kurs.record_id) ?? 0;
    const max = kurs.fields.max_teilnehmer ?? 0;
    if (max === 0) return null;
    return { count, max, pct: Math.min(100, Math.round((count / max) * 100)) };
  };

  const getAuslastungColor = (pct: number) => {
    if (pct >= 100) return 'bg-destructive';
    if (pct >= 80) return 'bg-amber-500';
    return 'bg-primary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Kursübersicht</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Verwalten Sie Kurse und Anmeldungen</p>
        </div>
        <Button onClick={() => { setEditKurs(null); setKursDialogOpen(true); }} className="gap-2">
          <IconPlus size={16} stroke={1.5} />
          Neuer Kurs
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Kurse"
          value={String(kurse.length)}
          description="Gesamt"
          icon={<IconBook size={18} stroke={1.5} className="text-muted-foreground" />}
        />
        <StatCard
          title="Anmeldungen"
          value={String(anmeldungen.length)}
          description={`${bezahltCount} bezahlt`}
          icon={<IconUsers size={18} stroke={1.5} className="text-muted-foreground" />}
        />
        <StatCard
          title="Teilnehmer"
          value={String(teilnehmer.length)}
          description="Registriert"
          icon={<IconSchool size={18} stroke={1.5} className="text-muted-foreground" />}
        />
        <StatCard
          title="Umsatz"
          value={formatCurrency(umsatz)}
          description="Bezahlte Kurse"
          icon={<IconCurrencyEuro size={18} stroke={1.5} className="text-muted-foreground" />}
        />
      </div>

      {/* Main workspace: split view */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Course list */}
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest px-1">Kurse</h2>
          {enrichedKurse.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Noch keine Kurse vorhanden.<br />
              <button
                className="mt-2 text-primary underline underline-offset-2 text-sm"
                onClick={() => { setEditKurs(null); setKursDialogOpen(true); }}
              >
                Ersten Kurs erstellen
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {enrichedKurse.map(kurs => {
                const auslastung = getAuslastung(kurs);
                const isSelected = selectedKursId === kurs.record_id;
                return (
                  <div
                    key={kurs.record_id}
                    onClick={() => setSelectedKursId(isSelected ? null : kurs.record_id)}
                    className={`group relative rounded-2xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {kurs.fields.titel ?? 'Ohne Titel'}
                          </p>
                          {isSelected && <IconChevronRight size={14} stroke={1.5} className="text-primary shrink-0" />}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          {kurs.dozentName && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <IconSchool size={11} stroke={1.5} />
                              {kurs.dozentName}
                            </span>
                          )}
                          {kurs.raumName && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <IconMapPin size={11} stroke={1.5} />
                              {kurs.raumName}
                            </span>
                          )}
                          {kurs.fields.startdatum && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <IconCalendar size={11} stroke={1.5} />
                              {formatDate(kurs.fields.startdatum)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {kurs.fields.preis != null && (
                          <Badge variant="secondary" className="text-xs">
                            {formatCurrency(kurs.fields.preis)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {auslastung && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Auslastung</span>
                          <span className={`text-xs font-medium ${auslastung.pct >= 100 ? 'text-destructive' : auslastung.pct >= 80 ? 'text-amber-600' : 'text-primary'}`}>
                            {auslastung.count}/{auslastung.max}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getAuslastungColor(auslastung.pct)}`}
                            style={{ width: `${auslastung.pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => { setEditKurs(kurs); setKursDialogOpen(true); }}
                        title="Bearbeiten"
                      >
                        <IconPencil size={13} stroke={1.5} />
                      </button>
                      <button
                        className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => setDeleteKursTarget(kurs)}
                        title="Löschen"
                      >
                        <IconTrash size={13} stroke={1.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel: Anmeldungen for selected course */}
        <div className="lg:col-span-3">
          {!selectedKurs ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 h-full min-h-[300px] flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <IconBook size={22} stroke={1.5} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Kurs auswählen</p>
                <p className="text-xs text-muted-foreground mt-1">Klicken Sie auf einen Kurs, um die Anmeldungen zu verwalten</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Course detail header */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{selectedKurs.fields.titel ?? 'Ohne Titel'}</h3>
                    {selectedKurs.fields.beschreibung && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{selectedKurs.fields.beschreibung}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3">
                      {selectedKurs.dozentName && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <IconSchool size={14} stroke={1.5} />
                          <span>{selectedKurs.dozentName}</span>
                        </div>
                      )}
                      {selectedKurs.raumName && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <IconMapPin size={14} stroke={1.5} />
                          <span>{selectedKurs.raumName}</span>
                        </div>
                      )}
                      {selectedKurs.fields.startdatum && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <IconCalendar size={14} stroke={1.5} />
                          <span>{formatDate(selectedKurs.fields.startdatum)}{selectedKurs.fields.enddatum ? ` – ${formatDate(selectedKurs.fields.enddatum)}` : ''}</span>
                        </div>
                      )}
                      {selectedKurs.fields.preis != null && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <IconCurrencyEuro size={14} stroke={1.5} />
                          <span>{formatCurrency(selectedKurs.fields.preis)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => { setEditKurs(selectedKurs); setKursDialogOpen(true); }} className="gap-1">
                      <IconPencil size={13} stroke={1.5} />
                      Bearbeiten
                    </Button>
                  </div>
                </div>

                {/* Capacity bar */}
                {selectedKurs.fields.max_teilnehmer && (() => {
                  const count = anmeldungenByKurs.get(selectedKurs.record_id) ?? 0;
                  const max = selectedKurs.fields.max_teilnehmer;
                  const pct = Math.min(100, Math.round((count / max) * 100));
                  return (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Belegung</span>
                        <span className={`text-sm font-semibold ${pct >= 100 ? 'text-destructive' : pct >= 80 ? 'text-amber-600' : 'text-primary'}`}>
                          {count} / {max} Plätze
                          {pct >= 100 && <span className="ml-1 text-xs">(ausgebucht)</span>}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getAuslastungColor(pct)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Anmeldungen for this course */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    Anmeldungen ({kursAnmeldungen.length})
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setEditAnmeldung(null); setAnmeldungDialogOpen(true); }}
                    className="gap-1.5"
                  >
                    <IconUserPlus size={13} stroke={1.5} />
                    Anmeldung hinzufügen
                  </Button>
                </div>

                {kursAnmeldungen.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    Noch keine Anmeldungen für diesen Kurs.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {kursAnmeldungen.map(a => (
                      <div key={a.record_id} className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-accent/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-primary">
                              {(a.teilnehmerName || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{a.teilnehmerName || '—'}</p>
                            {a.fields.anmeldedatum && (
                              <p className="text-xs text-muted-foreground">Angemeldet am {formatDate(a.fields.anmeldedatum)}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {a.fields.bezahlt ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                              <IconCircleCheck size={11} stroke={1.5} />
                              Bezahlt
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                              <IconCircleX size={11} stroke={1.5} />
                              Offen
                            </span>
                          )}
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => { setEditAnmeldung(a); setAnmeldungDialogOpen(true); }}
                              title="Bearbeiten"
                            >
                              <IconPencil size={13} stroke={1.5} />
                            </button>
                            <button
                              className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              onClick={() => setDeleteAnmeldungTarget(a)}
                              title="Löschen"
                            >
                              <IconTrash size={13} stroke={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <KurseDialog
        open={kursDialogOpen}
        onClose={() => { setKursDialogOpen(false); setEditKurs(null); }}
        onSubmit={async (fields) => {
          if (editKurs) {
            await LivingAppsService.updateKurseEntry(editKurs.record_id, fields);
          } else {
            await LivingAppsService.createKurseEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={editKurs?.fields}
        dozentenList={dozenten}
        raeumeList={raeume}
        enablePhotoScan={AI_PHOTO_SCAN['Kurse']}
      />

      <AnmeldungenDialog
        open={anmeldungDialogOpen}
        onClose={() => { setAnmeldungDialogOpen(false); setEditAnmeldung(null); }}
        onSubmit={async (fields) => {
          const submitFields = { ...fields };
          if (!editAnmeldung && selectedKursId) {
            submitFields.kurs = createRecordUrl(APP_IDS.KURSE, selectedKursId);
          }
          if (editAnmeldung) {
            await LivingAppsService.updateAnmeldungenEntry(editAnmeldung.record_id, submitFields);
          } else {
            await LivingAppsService.createAnmeldungenEntry(submitFields);
          }
          fetchAll();
        }}
        defaultValues={
          editAnmeldung
            ? editAnmeldung.fields
            : selectedKursId
            ? { kurs: createRecordUrl(APP_IDS.KURSE, selectedKursId) }
            : undefined
        }
        kurseList={kurse}
        teilnehmerList={teilnehmer}
        enablePhotoScan={AI_PHOTO_SCAN['Anmeldungen']}
      />

      <ConfirmDialog
        open={!!deleteKursTarget}
        title="Kurs löschen"
        description={`Möchten Sie den Kurs "${deleteKursTarget?.fields.titel ?? ''}" wirklich löschen? Alle zugehörigen Anmeldungen bleiben erhalten.`}
        onConfirm={handleDeleteKurs}
        onClose={() => setDeleteKursTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteAnmeldungTarget}
        title="Anmeldung löschen"
        description={`Möchten Sie die Anmeldung von "${deleteAnmeldungTarget?.fields ? (teilnehmerMap.get(extractRecordId(deleteAnmeldungTarget.fields.teilnehmer) ?? '') ?? null)?.fields.vorname + ' ' + (teilnehmerMap.get(extractRecordId(deleteAnmeldungTarget.fields.teilnehmer) ?? '') ?? null)?.fields.nachname : ''}" wirklich löschen?`}
        onConfirm={handleDeleteAnmeldung}
        onClose={() => setDeleteAnmeldungTarget(null)}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="lg:col-span-3">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <IconAlertCircle size={22} stroke={1.5} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}
