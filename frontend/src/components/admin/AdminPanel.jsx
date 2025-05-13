import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { Navigate } from 'react-router-dom';
import apiStore from '../../stores/ApiStore';

const AdminPanel = observer(() => {
  const { user, isAuthenticated } = apiStore;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.roleName !== 'ADMIN') {
    return <Navigate to="/profile" />; 
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h3">Панель администратора</Card.Header>
            <Card.Body>
              <Card.Title>Добро пожаловать, Администратор!</Card.Title>
              <Card.Text>
                Это панель администратора. Здесь вы можете управлять пользователями, контентом и другими аспектами системы.
              </Card.Text>
              {/* Add admin-specific components and functionality here */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
});

export default AdminPanel;
