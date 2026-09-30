import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
const sb = url && key ? createClient(url, key) : null
const day = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 16)
const seed = [
  { id: 's1', name: 'Intro to Competitive Programming', category: 'Workshop', date: day(3), venue: 'Seminar Hall A', description: 'Learn problem-solving patterns and solve your first contest problems with mentors.', featured: true },
  { id: 's2', name: 'CodeChef Starters Watch Party', category: 'Contest', date: day(6), venue: 'Computer Lab 2', description: 'Compete in the weekly Starters contest together, with snacks and live editorials.', featured: false },
  { id: 's3', name: 'Build a Web App in 3 Hours', category: 'Hackathon', date: day(12), venue: 'Innovation Center', description: 'Teams ship a working project from scratch. Prizes for the best three.', featured: false },
  { id: 's4', name: 'Alumni Talk: Life at a Product Company', category: 'Talk', date: day(20), venue: 'Auditorium', description: 'ABESEC alumni share interview tips and what engineering work is really like.', featured: false }]
const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
const chk = ({ error }) => { if (error) throw new Error(error.message); }
export const api = {
  async events() {
    if (sb) { const r = await sb.from('events').select('*').order('date'); chk(r); return r.data }
    return ls('events', seed).sort((a, b) => a.date.localeCompare(b.date))
  },
  async saveEvent(e) {
    if (sb) return chk(e.id ? await sb.from('events').update(e).eq('id', e.id) : await sb.from('events').insert(e))
    const all = ls('events', seed)
    save('events', e.id ? all.map(x => x.id === e.id ? e : x) : [...all, { ...e, id: uid() }])
  },
  async deleteEvent(id) {
    if (sb) return chk(await sb.from('events').delete().eq('id', id))
    save('events', ls('events', seed).filter(x => x.id !== id)); save('regs', ls('regs', []).filter(r => r.event_id !== id))
  },
  async register(r) {
    if (sb) { const x = await sb.from('registrations').insert(r); if (x.error?.code === '23505') throw new Error('This email is already registered for this event.'); return chk(x) }
    const all = ls('regs', [])
    if (all.some(x => x.event_id === r.event_id && x.email.toLowerCase() === r.email.toLowerCase())) throw new Error('This email is already registered for this event.')
    save('regs', [...all, { ...r, id: uid(), created_at: new Date().toISOString() }])
  },
  async regs() {
    if (sb) { const r = await sb.from('registrations').select('*').order('created_at', { ascending: false }); chk(r); return r.data }
    return ls('regs', []).reverse()
  }
}
