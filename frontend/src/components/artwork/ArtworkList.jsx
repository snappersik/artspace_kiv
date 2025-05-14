import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Pagination, Spinner, Form } from 'react-bootstrap';
import apiStore from '../../stores/ApiStore';
import { debounce } from 'lodash'; // Для задержки поиска

const ArtworkList = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTitle, setSearchTitle] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState(''); // Для фактического запроса
  const size = 9;

  const fetchArtworksData = useCallback(async (currentPage, titleQuery) => {
    setLoading(true);
    try {
      let data;
      if (titleQuery) {
        // Предполагаем, что searchArtworks принимает DTO, создадим его
        data = await apiStore.searchArtworks({ title: titleQuery }, currentPage, size);
      } else {
        data = await apiStore.fetchArtworks(currentPage, size);
      }
      setArtworks(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(data.number || 0);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      setArtworks([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchArtworksData(page, currentSearchTerm);
  }, [page, currentSearchTerm, fetchArtworksData]);

  const debouncedSearch = useCallback(
    debounce((searchTermValue) => {
      setPage(0); // Сброс на первую страницу при новом поиске
      setCurrentSearchTerm(searchTermValue); // Это вызовет useEffect для загрузки данных
    }, 500),
    [] // Зависимостей нет, т.к. setCurrentSearchTerm стабилен
  );

  const handleSearchInputChange = (e) => {
    const { value } = e.target;
    setSearchTitle(value);
    debouncedSearch(value);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Произведения искусства</h1>
      
      <Form onSubmit={(e) => e.preventDefault()} className="mb-4"> {/* onSubmit для предотвращения перезагрузки */}
        <Row>
          <Col md={10}>
            <Form.Control
              type="text"
              placeholder="Поиск по названию"
              value={searchTitle}
              onChange={handleSearchInputChange}
            />
          </Col>
        </Row>
      </Form>
      
      {loading && artworks.length === 0 ? ( // Показываем спиннер только при первой загрузке или если список пуст
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {artworks.length > 0 ? (
            <Row>
              {artworks.map(artwork => (
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
              ))}
            </Row>
          ) : (
             <Col>
                <p className="text-center">Произведения не найдены {currentSearchTerm && `по запросу "${currentSearchTerm}"`}</p>
              </Col>
          )}
          
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
