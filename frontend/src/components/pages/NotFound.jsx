import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="text-center py-5">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">Страница не найдена</h2>
      <p className="lead mb-4">Извините, запрашиваемая страница не существует.</p>
      <Button as={Link} to="/" variant="primary">Вернуться на главную</Button>
    </Container>
  );
};

export default NotFound;
