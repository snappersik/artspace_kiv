import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';
import apiStore from '../../stores/ApiStore';

const Profile = observer(() => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = apiStore;
  
  useEffect(() => {
    // Если пользователь не аутентифицирован, перенаправляем на страницу входа
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <Container className="mt-5 text-center"><h3>Загрузка...</h3></Container>;
  }

  if (!user) {
    return null; // Или можно показать сообщение об ошибке
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header as="h3">Профиль пользователя</Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}><strong>Имя пользователя:</strong></Col>
            <Col md={9}>{user.login}</Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}><strong>Имя:</strong></Col>
            <Col md={9}>{user.firstName}</Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}><strong>Фамилия:</strong></Col>
            <Col md={9}>{user.lastName}</Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}><strong>Email:</strong></Col>
            <Col md={9}>{user.email}</Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}><strong>Телефон:</strong></Col>
            <Col md={9}>{user.phone || 'Не указан'}</Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}><strong>Адрес:</strong></Col>
            <Col md={9}>{user.address || 'Не указан'}</Col>
          </Row>
          <Button 
            variant="primary" 
            onClick={() => navigate('/profile/edit')}
            className="me-2"
          >
            Редактировать профиль
          </Button>
          <Button 
            variant="outline-danger" 
            onClick={() => apiStore.logout()}
          >
            Выйти
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
});

export default Profile;
