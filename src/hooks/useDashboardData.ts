import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Anmeldungen, Kurse, Raeume, Teilnehmer, Dozenten } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [anmeldungenData, kurseData, raeumeData, teilnehmerData, dozentenData] = await Promise.all([
        LivingAppsService.getAnmeldungen(),
        LivingAppsService.getKurse(),
        LivingAppsService.getRaeume(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getDozenten(),
      ]);
      setAnmeldungen(anmeldungenData);
      setKurse(kurseData);
      setRaeume(raeumeData);
      setTeilnehmer(teilnehmerData);
      setDozenten(dozentenData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [anmeldungenData, kurseData, raeumeData, teilnehmerData, dozentenData] = await Promise.all([
          LivingAppsService.getAnmeldungen(),
          LivingAppsService.getKurse(),
          LivingAppsService.getRaeume(),
          LivingAppsService.getTeilnehmer(),
          LivingAppsService.getDozenten(),
        ]);
        setAnmeldungen(anmeldungenData);
        setKurse(kurseData);
        setRaeume(raeumeData);
        setTeilnehmer(teilnehmerData);
        setDozenten(dozentenData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const kurseMap = useMemo(() => {
    const m = new Map<string, Kurse>();
    kurse.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kurse]);

  const raeumeMap = useMemo(() => {
    const m = new Map<string, Raeume>();
    raeume.forEach(r => m.set(r.record_id, r));
    return m;
  }, [raeume]);

  const teilnehmerMap = useMemo(() => {
    const m = new Map<string, Teilnehmer>();
    teilnehmer.forEach(r => m.set(r.record_id, r));
    return m;
  }, [teilnehmer]);

  const dozentenMap = useMemo(() => {
    const m = new Map<string, Dozenten>();
    dozenten.forEach(r => m.set(r.record_id, r));
    return m;
  }, [dozenten]);

  return { anmeldungen, setAnmeldungen, kurse, setKurse, raeume, setRaeume, teilnehmer, setTeilnehmer, dozenten, setDozenten, loading, error, fetchAll, kurseMap, raeumeMap, teilnehmerMap, dozentenMap };
}