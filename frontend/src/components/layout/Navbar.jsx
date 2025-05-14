import React from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import apiStore from '../../stores/ApiStore';

const Navbar = observer(() => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = apiStore;

  const handleLogout = async () => {
    await apiStore.logout();
    navigate('/login'); // Перенаправляем на страницу входа после выхода
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">ArtSpace</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Главная</Nav.Link>
            <Nav.Link as={Link} to="/artworks">Коллекция</Nav.Link>
            <Nav.Link as={Link} to="/artists">Художники</Nav.Link>
            <Nav.Link as={Link} to="/exhibitions">Выставки</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated && user ? (
              <>
                {user.roleName === 'ADMIN' && (
                  <Nav.Link as={Link} to="/admin" className="fw-bold text-warning">
                    Админ-панель
                  </Nav.Link>
                )}
                <NavDropdown title={user.login || 'Профиль'} id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">
                    Мой профиль
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Выйти
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button variant="outline-light" size="sm">Вход</Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="light" size="sm" className="ms-2">Регистрация</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
});

export default Navbar;
