import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Добавил useLocation
import { observer } from 'mobx-react';
import apiStore from '../../stores/ApiStore';

const Login = observer(() => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Для получения предыдущего пути
  const { loading, error, isAuthenticated, user } = apiStore;

  const from = location.state?.from?.pathname || "/"; // Путь для редиректа по умолчанию

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.roleName === 'ADMIN') {
        // Если пытались попасть на админскую страницу, идем туда, иначе в /admin
        navigate(from.startsWith('/admin') ? from : '/admin', { replace: true });
      } else {
        // Если пытались попасть на страницу профиля или любую другую защищенную, идем туда
        navigate(from === "/" && user.roleName !== 'ADMIN' ? "/profile" : from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    // apiStore.login() вызовет fetchUserProfile и обновит isAuthenticated и user.
    // useEffect выше обработает редирект.
    await apiStore.login(formData.login, formData.password);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="auth-card">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Вход в систему</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form noValidate validated={validated} onSubmit={handleSubmit} className="auth-form">
                {/* Поля формы без изменений */}
                <Form.Group className="mb-3" controlId="formBasicLogin">
                  <Form.Label>Логин</Form.Label>
                  <Form.Control
                    type="text" name="login" value={formData.login} onChange={handleChange}
                    required disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">Пожалуйста, введите логин</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password" name="password" value={formData.password} onChange={handleChange}
                    required disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">Пожалуйста, введите пароль</Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3" disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
});

export default Login;
