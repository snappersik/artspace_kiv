import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import apiStore from '../../stores/ApiStore';

const Login = observer(() => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = apiStore;

  // Если пользователь уже аутентифицирован, перенаправляем на профиль
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

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
    
    // Упрощаем обработку - apiStore.login сам обрабатывает ошибки
    const success = await apiStore.login(formData.login, formData.password);
    if (success) {
      navigate('/profile');
    }
  };

  return (
    <Container className="py-5 auth-container">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="auth-card">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Вход в систему</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit} className="auth-form">
                <Form.Group className="mb-3" controlId="login">
                  <Form.Label>Логин</Form.Label>
                  <Form.Control
                    type="text"
                    name="login"
                    value={formData.login}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    Пожалуйста, введите логин
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    Пожалуйста, введите пароль
                  </Form.Control.Feedback>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mt-3" 
                  disabled={loading}
                >
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
