import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AnmeldungenPage from '@/pages/AnmeldungenPage';
import KursePage from '@/pages/KursePage';
import RaeumePage from '@/pages/RaeumePage';
import TeilnehmerPage from '@/pages/TeilnehmerPage';
import DozentenPage from '@/pages/DozentenPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="anmeldungen" element={<AnmeldungenPage />} />
          <Route path="kurse" element={<KursePage />} />
          <Route path="raeume" element={<RaeumePage />} />
          <Route path="teilnehmer" element={<TeilnehmerPage />} />
          <Route path="dozenten" element={<DozentenPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}