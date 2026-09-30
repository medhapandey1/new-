import { useEffect, useState } from 'react'
import { Tabs, Tab, Table, Form, Button, Modal, Alert, Row, Col } from 'react-bootstrap'
import { api } from './api'
import { CATEGORIES, fmt } from './components'
const PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
const SHOW_DEMO = import.meta.env.VITE_DEMO_TOGGLE !== 'false' 
const blank = { name: '', category: 'Workshop', date: '', venue: '', description: '', featured: false }

export default function Admin() {
  const [ok, setOk] = useState(sessionStorage.getItem('admin') === '1'); const [pw, setPw] = useState(''); const [bad, setBad] = useState(false)
  const [events, setEvents] = useState([]); const [regs, setRegs] = useState([]); const [edit, setEdit] = useState(null)
  const [q, setQ] = useState(''); const [fe, setFe] = useState(''); const [err, setErr] = useState('')
  const load = () => Promise.all([api.events(), api.regs()]).then(([e, r]) => { setEvents(e); setRegs(r) }).catch(x => setErr(x.message))
  useEffect(() => { if (ok) load() }, [ok])
  if (!ok) return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="h3 fw-bold mb-3">Admin sign in</h1>
      <Form onSubmit={e => { e.preventDefault(); if (pw === PASS) { sessionStorage.setItem('admin', '1'); setOk(true) } else setBad(true) }}>
        <Form.Control type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} className="mb-2" />
        {bad && <Alert variant="danger">Wrong password. Try again.</Alert>}
        <Button type="submit">Sign in</Button>
      </Form>
      {SHOW_DEMO && <Form.Check type="switch" id="demo" className="mt-4" label="Demo mode: skip login" checked={false} onChange={() => { sessionStorage.setItem('admin', '1'); setOk(true) }} />}   
    </div>)
  const save = async e => { e.preventDefault(); try { await api.saveEvent(edit); setEdit(null); load() } catch (x) { setErr(x.message) } }
  const del = async ev => { if (confirm(`Delete "${ev.name}" and its registrations?`)) { await api.deleteEvent(ev.id); load() } }
  const name = id => events.find(e => e.id === id)?.name || 'Deleted event'
  const rows = regs.filter(r => (!fe || r.event_id === fe) && [r.name, r.email, r.college].join(' ').toLowerCase().includes(q.toLowerCase()))
  const f = k => e => setEdit({ ...edit, [k]: e.target.value })
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between mb-3"><h1 className="h3 fw-bold">Admin dashboard</h1>
        <Button variant="outline-secondary" size="sm" onClick={() => { sessionStorage.removeItem('admin'); setOk(false) }}>Sign out</Button></div>
      {err && <Alert variant="danger" dismissible onClose={() => setErr('')}>{err}</Alert>}
      <Tabs defaultActiveKey="events" className="mb-3">
        <Tab eventKey="events" title={`Events (${events.length})`}>
          <Button className="mb-3" onClick={() => setEdit(blank)}>Add event</Button>
          <div className="table-responsive"><Table hover><thead><tr><th>Name</th><th>Category</th><th>Date</th><th>Venue</th><th></th></tr></thead><tbody>
            {events.map(e => <tr key={e.id}><td>{e.name}{e.featured && ' (featured)'}</td><td>{e.category}</td><td>{fmt(e.date)}</td><td>{e.venue}</td>
              <td className="text-nowrap"><Button size="sm" variant="outline-primary" className="me-2" onClick={() => setEdit({ ...e, date: e.date.slice(0, 16) })}>Edit</Button>
                <Button size="sm" variant="outline-danger" onClick={() => del(e)}>Delete</Button></td></tr>)}
          </tbody></Table></div>
        </Tab>
        <Tab eventKey="regs" title={`Registrations (${regs.length})`}>
          <Row className="g-2 mb-3"><Col md={7}><Form.Control placeholder="Search by name, email or college" value={q} onChange={e => setQ(e.target.value)} /></Col>
            <Col md={5}><Form.Select value={fe} onChange={e => setFe(e.target.value)}><option value="">All events</option>{events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</Form.Select></Col></Row>
          {!rows.length && <p>No registrations found.</p>}
          <div className="table-responsive"><Table hover><thead><tr><th>Name</th><th>Email</th><th>College</th><th>Year</th><th>Phone</th><th>Event</th></tr></thead><tbody>
            {rows.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.email}</td><td>{r.college}</td><td>{r.year}</td><td>{r.phone}</td><td>{name(r.event_id)}</td></tr>)}
          </tbody></Table></div>
        </Tab>
      </Tabs>
      {edit && <Modal show onHide={() => setEdit(null)} centered><Form onSubmit={save}>
        <Modal.Header closeButton><Modal.Title className="h5">{edit.id ? 'Edit event' : 'Add event'}</Modal.Title></Modal.Header>
        <Modal.Body className="vstack gap-3">
          <Form.Control required placeholder="Event name" value={edit.name} onChange={f('name')} />
          <Form.Select value={edit.category} onChange={f('category')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Form.Select>
          <Form.Control required type="datetime-local" value={edit.date} onChange={f('date')} />
          <Form.Control required placeholder="Venue" value={edit.venue} onChange={f('venue')} />
          <Form.Control required as="textarea" rows={3} placeholder="Description" value={edit.description} onChange={f('description')} />
          <Form.Check label="Feature on home page" checked={!!edit.featured} onChange={e => setEdit({ ...edit, featured: e.target.checked })} />
        </Modal.Body><Modal.Footer><Button type="submit">Save event</Button></Modal.Footer></Form></Modal>}
    </div>)
}
