import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Pagination, Spinner, Form } from 'react-bootstrap';
import apiStore from '../../stores/ApiStore';

const ArtworkList = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTitle, setSearchTitle] = useState('');
  const size = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiStore.fetchArtworks(page, size);
        setArtworks(data.content || []);
        setTotalPages(Math.ceil(data.totalElements / size) || 0);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Здесь можно добавить поиск по названию
    console.log('Searching for:', searchTitle);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Произведения искусства</h1>
      
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col md={10}>
            <Form.Control
              type="text"
              placeholder="Поиск по названию"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Button type="submit" variant="primary" className="w-100">Поиск</Button>
          </Col>
        </Row>
      </Form>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Row>
            {artworks.length > 0 ? (
              artworks.map(artwork => (
                <Col key={artwork.id} md={4} className="mb-4">
                  <Card className="h-100">
                    <Card.Img 
                      variant="top" 
                      src={artwork.imgPath || `https://placekitten.com/300/${200 + artwork.id}`} 
                      alt={artwork.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body>
                      <Card.Title>{artwork.title}</Card.Title>
                      <Card.Text>
                        <strong>Художник:</strong> {artwork.artistName || 'Неизвестен'}<br />
                        <strong>Категория:</strong> {artwork.category || 'Не указана'}<br />
                        {artwork.price && <strong>Цена:</strong>} {artwork.price && `${artwork.price} руб.`}
                      </Card.Text>
                      <Button variant="primary">Подробнее</Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-center">Произведения не найдены</p>
              </Col>
            )}
          </Row>
          
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First onClick={() => handlePageChange(0)} disabled={page === 0} />
                <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 0} />
                
                {[...Array(totalPages).keys()].map(number => (
                  <Pagination.Item 
                    key={number} 
                    active={number === page}
                    onClick={() => handlePageChange(number)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1} />
                <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={page === totalPages - 1} />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default ArtworkList;
