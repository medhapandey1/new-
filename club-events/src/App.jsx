import { Routes, Route, NavLink } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { Home, Events } from './pages'
import Admin from './Admin'
export default function App() {
  return (<>
    <Navbar expand="sm" variant="dark"><Container>
      <Navbar.Brand as={NavLink} to="/">CodeChef ABESEC</Navbar.Brand><Navbar.Toggle />
      <Navbar.Collapse><Nav className="ms-auto">
        <Nav.Link as={NavLink} to="/" end>Home</Nav.Link><Nav.Link as={NavLink} to="/events">Events</Nav.Link><Nav.Link as={NavLink} to="/admin">Admin</Nav.Link>
      </Nav></Navbar.Collapse></Container></Navbar>
    <Routes><Route path="/" element={<Home />} /><Route path="/events" element={<Events />} /><Route path="/admin" element={<Admin />} /></Routes>
  </>)
}
