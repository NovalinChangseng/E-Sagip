'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, Siren } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import QueueList from '../../components/QueueList';
import IncidentMap from '../../components/IncidentMap';
import { THEMES } from '../../lib/themes';
import { INITIAL_INCIDENTS, hydrateIncidents } from '../../lib/mockData';
import { STORAGE_KEYS, readStorage, writeStorage } from '../../lib/storage';
import { playIncomingAlert } from '../../lib/alertSound';
import { HistoryView, IncidentCard, MapCallersCard, SettingsView } from '../../components/dashboard/DashboardViews';

const DEFAULT_SETTINGS = { sound: true, refresh: true, status: true, system: true };

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedId, setSelectedId] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const s = readStorage(STORAGE_KEYS.session, null);
    if (!s || !THEMES[s.role]) {
      window.localStorage.removeItem(STORAGE_KEYS.session);
      router.replace('/login');
      return;
    }
    setSession(s);
    const stored = readStorage(STORAGE_KEYS.incidents, null);
    if (Array.isArray(stored)) {
      setAlerts(hydrateIncidents(stored));
    } else {
      const initial = hydrateIncidents(INITIAL_INCIDENTS);
      setAlerts(initial);
      writeStorage(STORAGE_KEYS.incidents, initial);
    }
    setSettings({ ...DEFAULT_SETTINGS, ...readStorage(STORAGE_KEYS.settings, {}) });
  }, [router]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const role = session?.role;
  const theme = role ? THEMES[role] : THEMES.fire;
  const saveAlerts = useCallback(next => {
    setAlerts(next);
    writeStorage(STORAGE_KEYS.incidents, next);
  }, []);

  const departmentAlerts = useMemo(() => alerts.filter(a => a.type === role), [alerts, role]);
  const activeAlerts = useMemo(() => {
    const list = departmentAlerts.filter(a => a.status !== 'resolved');
    const order = { pending: 0, accepted: 1, resolved: 2 };
    return [...list].sort((a, b) => (order[a.status] ?? 99) - (order[b.status] ?? 99) || b.reportedAt - a.reportedAt);
  }, [departmentAlerts]);

  useEffect(() => {
    if (activeAlerts.length && !activeAlerts.some(a => a.id === selectedId)) setSelectedId(activeAlerts[0].id);
    if (!activeAlerts.length) setSelectedId(null);
  }, [activeAlerts, selectedId]);

  const selected = activeAlerts.find(a => a.id === selectedId) || activeAlerts[0];
  const activeCount = departmentAlerts.filter(a => a.status !== 'resolved').length;

  const flash = useCallback(message => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }, []);

  const updateStatus = useCallback((id, nextStatus) => {
    const current = alerts.find(a => a.id === id);
    if (!current || current.type !== role) return;
    if (nextStatus === 'accepted' && current.status !== 'pending') return;
    if (nextStatus === 'resolved' && current.status !== 'accepted') return;

    const next = alerts.map(a => a.id === id
      ? { ...a, status: nextStatus, resolvedAt: nextStatus === 'resolved' ? Date.now() : a.resolvedAt }
      : a
    );
    saveAlerts(next);
    if (nextStatus === 'accepted') flash('Incident accepted and units dispatched.');
    if (nextStatus === 'resolved') {
      setSelectedId(null);
      flash('Incident resolved and moved to Incident History.');
    }
  }, [alerts, role, saveAlerts, flash]);

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEYS.session);
    router.replace('/');
  };

  const toggle = key => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    writeStorage(STORAGE_KEYS.settings, next);
  };

  const resetData = () => {
    const initial = hydrateIncidents(INITIAL_INCIDENTS);
    saveAlerts(initial);
    setActiveTab('queue');
    flash('Incident records reset.');
  };

  const simulate = () => {
    if (!role) return;
    const coords = [
      { lat: 14.697, lng: 121.061, barangay: 'Commonwealth' },
      { lat: 14.718, lng: 121.029, barangay: 'Bagbag' },
      { lat: 14.681, lng: 121.073, barangay: 'Payatas' }
    ];
    const c = coords[Math.floor(Math.random() * coords.length)];
    const names = { fire: 'Emergency Caller', medical: 'Mobile Caller', crime: 'Reporting Citizen' };
    const next = {
      id: Date.now(), type: role, caller: names[role], phone: '0917-000-0000',
      barangay: c.barangay, lat: c.lat, lng: c.lng, status: 'pending', reportedAt: Date.now(),
      description: `Drill alert for ${theme.label.toLowerCase()} used to verify the dispatch workflow.`
    };
    saveAlerts([next, ...alerts]);
    setSelectedId(next.id);
    setActiveTab('queue');
    if (settings.sound) playIncomingAlert();
    flash('New alert received.');
  };

  if (!session) return <div className="min-h-screen grid place-items-center bg-[#FAF7F2] text-sm text-gray-500">Loading E-Sagip console...</div>;

  return (
    <div className="h-screen flex bg-[#FAF7F2] overflow-hidden" style={{ '--theme-accent': theme.hex, '--theme-accent-dark': theme.darkHex, '--theme-accent-soft': theme.softHex }}>
      <Sidebar theme={theme} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-['Space_Grotesk'] font-bold text-xl">{activeTab === 'queue' ? 'Live Queue' : activeTab === 'map' ? 'Tactical Map' : activeTab === 'history' ? 'Incident History' : 'Settings'}</h1>
              <span className="live-badge" style={{ backgroundColor: theme.softHex, color: theme.hex }}><span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.hex }} />Live</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{theme.label} · {activeCount} active incident{activeCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={simulate} className="secondary-btn hidden sm:flex"><Siren className="h-4 w-4" /> Run Drill Alert</button>
            <div className="relative">
              <button onClick={() => setProfileOpen(v => !v)} className="profile-btn"><span className="h-7 w-7 rounded-full grid place-items-center" style={{ backgroundColor: theme.softHex, color: theme.hex }}><span className="text-xs font-bold">{(session.name || session.email)[0].toUpperCase()}</span></span><ChevronDown className="h-4 w-4 text-gray-400" /></button>
              {profileOpen && <div className="profile-menu">
                <div className="px-3 py-2 border-b"><div className="font-semibold text-sm truncate">{session.name || 'Dispatcher'}</div><div className="text-xs text-gray-500 truncate">{session.email}</div><div className="text-xs font-semibold mt-1" style={{ color: theme.hex }}>{theme.label}</div></div>
                <button onClick={() => { setActiveTab('settings'); setProfileOpen(false); }} className="menu-item">Settings</button>
                <button onClick={logout} className="menu-item text-red-600">Log out</button>
              </div>}
            </div>
          </div>
        </header>

        {activeTab === 'queue' && <>
          <div className="h-12 bg-white border-b border-gray-200 flex items-center px-6 shrink-0 text-sm font-semibold" style={{ color: theme.hex }}>Active caller alerts ({activeCount})</div>
          <div className="flex-1 overflow-hidden flex relative">
            <QueueList alerts={activeAlerts} selectedAlertId={selectedId} setSelectedAlertId={setSelectedId} theme={theme} />
            <div className="flex-1 relative min-w-0 map-pane"><IncidentMap alerts={activeAlerts} theme={theme} selectedId={selectedId} onSelectAlert={setSelectedId} /></div>
            {selected && <IncidentCard alert={selected} theme={theme} now={now} onAccept={() => updateStatus(selected.id, 'accepted')} onResolve={() => updateStatus(selected.id, 'resolved')} />}
          </div>
        </>}

        {activeTab === 'map' && (() => {
          const activeOnMap = departmentAlerts.filter(a => a.status !== 'resolved');
          const goToCaller = id => { setSelectedId(id); setActiveTab('queue'); };
          return <div className="flex-1 relative">
            <IncidentMap alerts={activeOnMap} theme={theme} selectedId={null} onSelectAlert={goToCaller} />
            <MapCallersCard alerts={activeOnMap} theme={theme} onSelectAlert={goToCaller} />
          </div>;
        })()}
        {activeTab === 'history' && <HistoryView alerts={departmentAlerts.filter(a => a.status === 'resolved')} theme={theme} />}
        {activeTab === 'settings' && <SettingsView settings={settings} toggle={toggle} theme={theme} session={session} resetData={resetData} />}
        {toast && <div className="toast"><CheckCircle2 className="h-4 w-4" style={{ color: theme.hex }} />{toast}</div>}
      </main>
    </div>
  );
}
