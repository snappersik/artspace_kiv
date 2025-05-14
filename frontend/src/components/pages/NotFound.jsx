import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="py-5 text-center">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">Страница не найдена</h2>
      <p className="mb-4">Извините, запрашиваемая страница не существует.</p>
      <div className="d-flex justify-content-center gap-3">
        <Button variant="secondary" onClick={handleGoBack}>
          Вернуться назад
        </Button>
        <Button variant="primary" as={Link} to="/">
          Вернуться на главную
        </Button>
      </div>
    </Container>
  );
};

export default NotFound;
