import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Pagination, Spinner } from 'react-bootstrap';
import apiStore from '../../stores/ApiStore';

const ArtistList = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiStore.fetchArtists(page, size);
        setArtists(data.content || []);
        setTotalPages(Math.ceil(data.totalElements / size) || 0);
      } catch (error) {
        console.error('Error fetching artists:', error);
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

  return (
    <Container className="py-4">
      <h1 className="mb-4">Художники</h1>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Row>
            {artists.length > 0 ? (
              artists.map(artist => (
                <Col key={artist.id} md={4} className="mb-4">
                  <Card className="h-100">
                    <Card.Img 
                      variant="top" 
                      src={artist.imgPath || `https://placekitten.com/300/${300 + artist.id}`} 
                      alt={artist.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body>
                      <Card.Title>{artist.name}</Card.Title>
                      <Card.Text>
                        <strong>Страна:</strong> {artist.country || 'Не указано'}<br />
                        {artist.biography && (
                          <span className="text-truncate d-block">{artist.biography}</span>
                        )}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-center">Художники не найдены</p>
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

export default ArtistList;
