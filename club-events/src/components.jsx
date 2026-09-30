import { useState } from 'react'
import { Modal, Form, Button, Alert, Badge } from 'react-bootstrap'
import { api } from './api'
export const CATEGORIES = ['Workshop', 'Contest', 'Hackathon', 'Talk', 'Social']
export const fmt = d => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

export function EventCard({ e, onRegister }) {
  return (
    <div className="card h-100 event-card"><div className="card-body d-flex flex-column">
      <Badge bg="warning" text="dark" className="align-self-start mb-2">{e.category}</Badge>
      <h5 className="fw-bold">{e.name}</h5>
      <p className="text-muted small mb-2">{fmt(e.date)}<br />{e.venue}</p>
      <p className="flex-grow-1">{e.description}</p>
      <Button onClick={() => onRegister(e)}>Register</Button>
    </div></div>
  )
}

export function RegisterModal({ event, onClose }) {
  const [f, setF] = useState({ name: '', email: '', college: '', year: '1st year', phone: '' })
  const [st, setSt] = useState({})
  const set = k => x => setF({ ...f, [k]: x.target.value })
  const submit = async ev => {
    ev.preventDefault(); setSt({ busy: true })
    try { await api.register({ ...f, event_id: event.id }); setSt({ ok: true }) } catch (err) { setSt({ err: err.message }) }
  }
  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton><Modal.Title className="h5">Register for {event.name}</Modal.Title></Modal.Header>
      {st.ok ? <Modal.Body><Alert variant="success" className="mb-0">You're registered. See you at {event.venue}.</Alert></Modal.Body> :
        <Form onSubmit={submit}><Modal.Body className="vstack gap-3">
          {st.err && <Alert variant="danger" className="mb-0">{st.err}</Alert>}
          <Form.Group><Form.Label>Full name</Form.Label><Form.Control required value={f.name} onChange={set('name')} /></Form.Group>
          <Form.Group><Form.Label>Email</Form.Label><Form.Control required type="email" value={f.email} onChange={set('email')} /></Form.Group>
          <Form.Group><Form.Label>College</Form.Label><Form.Control required value={f.college} onChange={set('college')} /></Form.Group>
          <Form.Group><Form.Label>Year</Form.Label><Form.Select value={f.year} onChange={set('year')}>{['1st year', '2nd year', '3rd year', '4th year'].map(y => <option key={y}>{y}</option>)}</Form.Select></Form.Group>
          <Form.Group><Form.Label>Phone number</Form.Label><Form.Control required type="tel" pattern="[0-9]{10}" title="10 digit phone number" value={f.phone} onChange={set('phone')} /></Form.Group>
        </Modal.Body><Modal.Footer><Button type="submit" disabled={st.busy}>Submit registration</Button></Modal.Footer></Form>}
    </Modal>
  )
}
