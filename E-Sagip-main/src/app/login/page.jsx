'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { THEMES, EMAIL_PLACEHOLDER } from '../../lib/themes';
import { STORAGE_KEYS, readStorage, writeStorage } from '../../lib/storage';

const BRAND_COPY = {
  fire: { title: 'Fire emergency access.', desc: 'Manage fire calls, coordinate engine dispatch, and track incidents in real time.' },
  medical: { title: 'Medical response access.', desc: 'Triage calls, dispatch responders, and monitor ongoing medical incidents.' },
  crime: { title: 'Crime & police access.', desc: 'Review reports, coordinate patrol response, and track case status.' }
};
const DEFAULT_COPY = { title: 'Welcome back.', desc: 'Sign in to manage emergency calls, dispatch units, view the tactical map, and maintain incident records.' };

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('fire');
  const [registered, setRegistered] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const selectedTheme = THEMES[role] || THEMES.fire;
  const copy = BRAND_COPY[role] || DEFAULT_COPY;
  const BrandIcon = selectedTheme?.icon;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const department = params.get('department');
    if (THEMES[department]) setRole(department);
    setRegistered(params.get('registered') === '1');
  }, []);

  function submit(e) {
    e.preventDefault();
    setError('');
    if (!role) return setError('Please select your dispatch department.');
    const users = readStorage(STORAGE_KEYS.users, []);
    const normalized = email.trim().toLowerCase();
    const user = users.find(u => u.email === normalized && u.role === role && u.password === password);
    if (!user) {
      return setError('Invalid email, password, or department. If you do not have an account yet, please register.');
    }
    writeStorage(STORAGE_KEYS.session, { email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}`.trim() });
    router.push('/dashboard');
  }

  return (
    <main className="auth-shell" style={{ '--theme-accent': selectedTheme.hex, '--theme-accent-dark': selectedTheme.darkHex, '--theme-accent-soft': selectedTheme.softHex, '--theme-accent-border': selectedTheme.borderHex }}>
      <section className="auth-brand" style={{ backgroundColor: selectedTheme.hex }}>
        <img src="/logo.png" alt="E-Sagip" className="auth-logo" />
        <div className="mt-10 max-w-sm">
          <div className="eyebrow" style={{ color: '#fff' }}>Responder access</div>
          <div className="brand-role-badge" style={{ backgroundColor: 'rgba(255,255,255,.18)', color: '#fff' }}><BrandIcon className="h-3.5 w-3.5" />{selectedTheme.label}</div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight" style={{ color: '#fff' }}>{copy.title}</h1>
          <p className="mt-4 text-sm leading-7" style={{ color: '#fff' }}>{copy.desc}</p>
        </div>
      </section>
      <section className="auth-form-wrap">
        <div className="w-full max-w-md">
          <button onClick={() => router.push('/')} className="mb-8 text-sm font-semibold text-gray-500 hover:text-gray-900">← Back to E-Sagip</button>
          <div className="eyebrow" style={{ color: 'var(--theme-accent)' }}>Responder access</div>
          <h2 className="mt-2 text-3xl font-bold">Sign in</h2>
          <p className="mt-2 text-sm text-gray-500">Choose the department assigned to your account.</p>
          {registered && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">Account created. Please sign in to open the dispatch console.</div>}
          <form onSubmit={submit} className="mt-7 space-y-5">
            <div>
              <label className="field-label">Dispatch department</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(THEMES).map(theme => {
                  const Icon = theme.icon;
                  const selected = role === theme.id;
                  return <button type="button" key={theme.id} onClick={() => setRole(theme.id)} className={`role-card ${selected ? 'shadow-sm' : ''}`} style={selected ? { borderColor: theme.hex, backgroundColor: theme.softHex } : undefined}>
                    <span className="icon-box" style={selected ? { backgroundColor: theme.hex } : { backgroundColor: '#F3F4F6' }}><Icon className="h-4 w-4" style={{ color: selected ? '#fff' : '#6B7280' }} /></span>
                    <span className="text-xs font-semibold" style={selected ? { color: theme.hex } : undefined}>{theme.short}</span>
                    {selected && <CheckCircle className="absolute right-2 top-2 h-4 w-4" style={{ color: theme.hex }} />}
                  </button>;
                })}
              </div>
            </div>
            <div><label className="field-label">Email address</label><input className="field" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={EMAIL_PLACEHOLDER} /></div>
            <div><label className="field-label">Password</label><div className="relative"><input className="field pr-11" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <button className={`primary-btn w-full ${role ? 'text-white' : 'text-gray-500 cursor-not-allowed'}`} style={{ backgroundColor: role ? selectedTheme.hex : '#D1D5DB', boxShadow: role ? `0 6px 18px ${selectedTheme.hex}33` : 'none' }} disabled={!role}>Login to E-Sagip <ArrowRight className="h-4 w-4" /></button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">No account yet? <button onClick={() => router.push('/register')} className="font-semibold text-gray-900 hover:underline">Register</button></p>
        </div>
      </section>
    </main>
  );
}
