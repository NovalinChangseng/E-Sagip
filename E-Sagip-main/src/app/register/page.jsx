'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { THEMES } from '../../lib/themes';
import { STORAGE_KEYS, readStorage, writeStorage } from '../../lib/storage';

const BRAND_COPY = {
  fire: { title: 'Join the fire response team.', desc: 'Create a dispatcher profile to manage fire calls and coordinate engine dispatch.' },
  medical: { title: 'Join the medical response team.', desc: 'Create a dispatcher profile to triage calls and coordinate medical response.' },
  crime: { title: 'Join the police response team.', desc: 'Create a dispatcher profile to review reports and coordinate patrol response.' }
};
const DEFAULT_COPY = { title: 'Set up access.', desc: 'Create a dispatcher profile and choose the emergency department you are assigned to.' };

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('fire');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const selectedTheme = THEMES[role] || THEMES.fire;
  const copy = BRAND_COPY[role] || DEFAULT_COPY;
  const BrandIcon = selectedTheme?.icon;
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  function submit(e) {
    e.preventDefault(); setError('');
    if (!role) return setError('Select a dispatch department.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    const users = readStorage(STORAGE_KEYS.users, []);
    const email = form.email.trim().toLowerCase();
    if (users.some(u => u.email === email)) return setError('An account with this email already exists.');
    const user = { id: crypto.randomUUID(), firstName: form.firstName.trim(), lastName: form.lastName.trim(), email, password: form.password, role, createdAt: Date.now() };
    writeStorage(STORAGE_KEYS.users, [...users, user]);
    router.push(`/login?registered=1&department=${role}`);
  }

  return <main className="auth-shell auth-register-shell" style={{ '--theme-accent': selectedTheme.hex, '--theme-accent-dark': selectedTheme.darkHex, '--theme-accent-soft': selectedTheme.softHex, '--theme-accent-border': selectedTheme.borderHex }}>
    <section className="auth-brand" style={{ backgroundColor: selectedTheme.hex }}><img src="/logo.png" alt="E-Sagip" className="auth-logo" /><div className="mt-10 max-w-sm"><div className="eyebrow" style={{ color: '#fff' }}>Create account</div><div className="brand-role-badge" style={{ backgroundColor: 'rgba(255,255,255,.22)', color: '#fff' }}><BrandIcon className="h-3.5 w-3.5" />{selectedTheme.label}</div><h1 className="mt-3 text-4xl font-bold tracking-tight" style={{ color: '#fff' }}>{copy.title}</h1><p className="mt-4 text-sm leading-7" style={{ color: '#fff' }}>{copy.desc}</p></div></section>
    <section className="auth-form-wrap auth-register-wrap"><div className="w-full max-w-lg"><button onClick={() => router.push('/')} className="mb-8 text-sm font-semibold text-gray-500 hover:text-gray-900">← Back to E-Sagip</button><div className="eyebrow" style={{ color: 'var(--theme-accent)' }}>Create account</div><h2 className="mt-2 text-3xl font-bold">Register dispatcher</h2><form onSubmit={submit} className="mt-7 space-y-5 pb-2">
      <div><label className="field-label">Dispatch department</label><div className="grid gap-3">{Object.values(THEMES).map(theme => { const Icon=theme.icon; const selected=role===theme.id; return <button type="button" key={theme.id} onClick={()=>setRole(theme.id)} className={`relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition ${selected ? 'shadow-sm' : 'border-gray-100 hover:border-gray-200'}`} style={selected ? { borderColor: theme.hex, backgroundColor: theme.softHex } : undefined}><span className="icon-box h-10 w-10" style={selected ? { backgroundColor: theme.hex } : { backgroundColor: '#F3F4F6' }}><Icon className="h-5 w-5" style={{ color: selected ? '#fff' : '#6B7280' }} /></span><span><strong className="block text-sm" style={selected ? { color: theme.hex } : undefined}>{theme.label}</strong><small className="text-xs text-gray-500">Manage {theme.short.toLowerCase()} incidents</small></span>{selected&&<CheckCircle className="ml-auto h-5 w-5" style={{ color: theme.hex }} />}</button>})}</div></div>
      <div className="grid grid-cols-2 gap-4"><div><label className="field-label">First name</label><input className="field" name="firstName" required value={form.firstName} onChange={update} placeholder="Juan" /></div><div><label className="field-label">Last name</label><input className="field" name="lastName" required value={form.lastName} onChange={update} placeholder="Dela Cruz" /></div></div>
      <div><label className="field-label">Email address</label><input className="field" name="email" type="email" required value={form.email} onChange={update} placeholder="dispatcher@city.gov.ph" /></div>
      <div className="grid grid-cols-2 gap-4"><div><label className="field-label">Password</label><input className="field" name="password" type="password" required value={form.password} onChange={update} placeholder="At least 6 characters" /></div><div><label className="field-label">Confirm password</label><input className="field" name="confirm" type="password" required value={form.confirm} onChange={update} placeholder="Repeat password" /></div></div>
      {error&&<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <button type="submit" className="primary-btn register-submit w-full" style={{ backgroundColor: selectedTheme.hex, boxShadow: `0 6px 18px ${selectedTheme.hex}33`, color: '#fff' }}>Create Account <ArrowRight className="h-4 w-4" /></button>
    </form><p className="mt-5 pb-2 text-center text-sm text-gray-500">Already registered? <button onClick={()=>router.push('/login')} className="font-semibold text-gray-900 hover:underline">Sign in</button></p></div></section>
  </main>;
}
