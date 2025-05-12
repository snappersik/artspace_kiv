import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { observer } from 'mobx-react';
import apiStore from '../../stores/ApiStore';

const Navbar = observer(() => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = apiStore;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" expanded={expanded} className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">Центр Искусства</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(!expanded)} 
        />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/artworks" onClick={() => setExpanded(false)}>Произведения</Nav.Link>
            <Nav.Link as={Link} to="/artists" onClick={() => setExpanded(false)}>Художники</Nav.Link>
            <Nav.Link as={Link} to="/exhibitions" onClick={() => setExpanded(false)}>Выставки</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <span className="navbar-text me-3">
                  Привет, {user?.firstName || 'Пользователь'}
                </span>
                <Button variant="outline-light" onClick={handleLogout}>Выйти</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)}>Войти</Nav.Link>
                <Nav.Link as={Link} to="/register" onClick={() => setExpanded(false)}>Регистрация</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
});

export default Navbar;
