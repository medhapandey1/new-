import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Row, Col, Button } from 'react-bootstrap'
import { api } from './api'
import { EventCard, RegisterModal, CATEGORIES, fmt } from './components'

const useEvents = () => { const [ev, setEv] = useState(null); useEffect(() => { api.events().then(setEv).catch(() => setEv([])) }, []); return ev }

export function Home() {
  const events = useEvents(); const [reg, setReg] = useState(null)
  const upcoming = (events || []).filter(e => new Date(e.date) >= new Date())
  const featured = upcoming.find(e => e.featured) || upcoming[0]
  return (<>
    <section className="hero"><div className="container">
      <h1>CodeChef<br />ABESEC</h1>
      <p className="fs-5 mt-4">We are the coding club at ABESEC. Every week we run contests, workshops and hackathons so you can get better at problem solving and build things with other students.</p>
      <Link to="/events" className="btn btn-accent btn-lg mt-3">Browse events</Link>
    </div></section>
    <div className="container py-5">
      {featured && <div className="featured p-4 mb-5">
        <h2 className="h4 fw-bold">Featured event</h2>
        <h3 className="h2 fw-bold mt-3">{featured.name}</h3>
        <p className="mb-1">{fmt(featured.date)} at {featured.venue}</p>
        <p>{featured.description}</p>
        <Button onClick={() => setReg(featured)}>Register</Button>
      </div>}
      <h2 className="h3 fw-bold mb-3">Upcoming events</h2>
      {events && !upcoming.length && <p>No upcoming events yet. Check back soon.</p>}
      <Row className="g-4">{upcoming.slice(0, 3).map(e => <Col md={6} lg={4} key={e.id}><EventCard e={e} onRegister={setReg} /></Col>)}</Row>
      <Link to="/events" className="d-inline-block mt-4">See all events</Link>
    </div>
    {reg && <RegisterModal event={reg} onClose={() => setReg(null)} />}
  </>)
}

export function Events() {
  const events = useEvents(); const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [reg, setReg] = useState(null)
  const list = (events || []).filter(e => e.name.toLowerCase().includes(q.toLowerCase()) && (!cat || e.category === cat))
  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4">All events</h1>
      <Row className="g-2 mb-4">
        <Col md={8}><Form.Control placeholder="Search events by name" value={q} onChange={e => setQ(e.target.value)} /></Col>
        <Col md={4}><Form.Select value={cat} onChange={e => setCat(e.target.value)}><option value="">All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Form.Select></Col>
      </Row>
      {events && !list.length && <p>No events match your search. Try a different name or category.</p>}
      <Row className="g-4">{list.map(e => <Col md={6} lg={4} key={e.id}><EventCard e={e} onRegister={setReg} /></Col>)}</Row>
      {reg && <RegisterModal event={reg} onClose={() => setReg(null)} />}
    </div>
  )
}
