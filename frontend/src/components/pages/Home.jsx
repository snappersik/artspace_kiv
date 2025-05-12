import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import apiStore from '../../stores/ApiStore';

const Home = () => {
  const [currentExhibitions, setCurrentExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const exhibitions = await apiStore.fetchCurrentExhibitions();
        setCurrentExhibitions(exhibitions);
      } catch (error) {
        console.error('Error fetching exhibitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container>
      <section className="py-5 text-center">
        <h1 className="display-4">Добро пожаловать в Центр Современного Искусства</h1>
        <p className="lead">Исследуйте мир искусства через наши коллекции и выставки</p>
        <div className="d-flex justify-content-center gap-2 mt-4">
          <Button as={Link} to="/exhibitions" variant="primary" size="lg">Выставки</Button>
          <Button as={Link} to="/artworks" variant="outline-primary" size="lg">Коллекция</Button>
        </div>
      </section>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : (
        <>
          {currentExhibitions.length > 0 && (
            <section className="py-5">
              <h2 className="text-center mb-4">Текущие выставки</h2>
              <Carousel>
                {currentExhibitions.map((exhibition) => (
                  <Carousel.Item key={exhibition.id}>
                    <img
                      className="d-block w-100"
                      src={exhibition.imgPath || "https://via.placeholder.com/800x400?text=Выставка"}
                      alt={exhibition.title}
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                    <Carousel.Caption>
                      <h3>{exhibition.title}</h3>
                      <p>{exhibition.description}</p>
                      <Button as={Link} to={`/exhibitions/${exhibition.id}`} variant="light">Подробнее</Button>
                    </Carousel.Caption>
                  </Carousel.Item>
                ))}
              </Carousel>
            </section>
          )}

          <section className="py-5">
            <h2 className="text-center mb-4">Наши услуги</h2>
            <Row>
              <Col md={4} className="mb-4">
                <Card className="h-100">
                  <Card.Body className="text-center">
                    <div className="mb-3">
                      <i className="bi bi-palette fs-1"></i>
                    </div>
                    <Card.Title>Выставки</Card.Title>
                    <Card.Text>
                      Посетите наши разнообразные выставки современного искусства от известных и начинающих художников.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="h-100">
                  <Card.Body className="text-center">
                    <div className="mb-3">
                      <i className="bi bi-easel fs-1"></i>
                    </div>
                    <Card.Title>Мастер-классы</Card.Title>
                    <Card.Text>
                      Участвуйте в мастер-классах и развивайте свои творческие навыки под руководством профессионалов.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="h-100">
                  <Card.Body className="text-center">
                    <div className="mb-3">
                      <i className="bi bi-book fs-1"></i>
                    </div>
                    <Card.Title>Экскурсии</Card.Title>
                    <Card.Text>
                      Запишитесь на экскурсию с гидом, чтобы узнать больше о представленных произведениях искусства.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </section>
        </>
      )}
    </Container>
  );
};

export default Home;
