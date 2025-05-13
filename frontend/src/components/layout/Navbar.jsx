import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import apiStore from '../../stores/ApiStore'; // Ensure this path is correct

const Navbar = observer(() => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = apiStore;

  const handleLogout = async () => {
    await apiStore.logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">ArtSpace</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Главная</Nav.Link>
            <Nav.Link as={Link} to="/artworks">Произведения</Nav.Link>
            <Nav.Link as={Link} to="/artists">Художники</Nav.Link>
            <Nav.Link as={Link} to="/exhibitions">Выставки</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                {user?.roleName === 'ADMIN' && (
                  <Nav.Link as={Link} to="/admin">Админ. панель</Nav.Link>
                )}
                <Nav.Link as={Link} to="/profile">Профиль ({user?.login})</Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>Выйти</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Вход</Nav.Link>
                <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
});

export default Navbar;
