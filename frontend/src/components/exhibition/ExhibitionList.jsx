import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Pagination, Spinner } from 'react-bootstrap';
import apiStore from '../../stores/ApiStore';

const ExhibitionList = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiStore.fetchExhibitions(page, size);
        setExhibitions(data.content || []);
        setTotalPages(Math.ceil(data.totalElements / size) || 0);
      } catch (error) {
        console.error('Error fetching exhibitions:', error);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const isCurrentExhibition = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= now && now <= end;
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Выставки</h1>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Row>
            {exhibitions.length > 0 ? (
              exhibitions.map(exhibition => (
                <Col key={exhibition.id} md={4} className="mb-4">
                  <Card className="h-100">
                    <Card.Img 
                      variant="top" 
                      src={exhibition.imgPath || `https://placekitten.com/400/${200 + exhibition.id}`} 
                      alt={exhibition.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body>
                      <Card.Title>{exhibition.title}</Card.Title>
                      <Card.Text>
                        <Badge bg={isCurrentExhibition(exhibition.startDate, exhibition.endDate) ? "success" : "info"} className="me-2 mb-2">
                          {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                        </Badge>
                        <br />
                        <strong>Место:</strong> {exhibition.location || 'Не указано'}
                        {exhibition.description && (
                          <>
                            <br />
                            <span className="text-truncate d-block">{exhibition.description}</span>
                          </>
                        )}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-center">Выставки не найдены</p>
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

export default ExhibitionList;
