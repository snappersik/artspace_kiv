import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Alert, Card, Pagination, InputGroup, FormControl, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import apiStore from '../../stores/ApiStore';
import { debounce } from 'lodash';

const AdminArtworks = () => {
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]); // Для селекта в модалке
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [currentArtwork, setCurrentArtwork] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', creationDate: new Date().toISOString().split('T')[0],
    category: 'PAINTING', artistId: '', imgPath: ''
  });
  const [formMode, setFormMode] = useState('create');

  const [searchTerm, setSearchTerm] = useState({ title: '', artistName: '', category: '' });
  const [isSearching, setIsSearching] = useState(false);

  const fetchArtworksData = useCallback(async (page, searchPayload) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      const cleanedSearchPayload = Object.fromEntries(
        Object.entries(searchPayload).filter(([_, v]) => v !== '')
      );

      if (isSearching && Object.keys(cleanedSearchPayload).length > 0) {
        data = await apiStore.searchArtworks(cleanedSearchPayload, page, pageSize);
      } else {
        data = await apiStore.fetchArtworks(page, pageSize);
      }
      setArtworks(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.number || 0);
    } catch (err) {
      setError('Ошибка загрузки произведений: ' + (err.message || 'Неизвестная ошибка'));
      setArtworks([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize, isSearching]);
  
  const fetchArtistsForSelect = async () => {
      try {
        const allArtists = await apiStore.fetchAllArtists(); // Метод без пагинации
        setArtists(allArtists || []);
      } catch (err) {
        console.error("Ошибка загрузки художников для селекта:", err);
        setArtists([]);
      }
  };

  useEffect(() => {
    fetchArtworksData(currentPage, searchTerm);
  }, [fetchArtworksData, currentPage, searchTerm]);

   useEffect(() => {
    fetchArtistsForSelect(); // Загружаем один раз при монтировании
  }, []);


  const debouncedSearch = useCallback(
    debounce((newSearchTerm) => {
      setIsSearching(Object.values(newSearchTerm).some(val => val !== ''));
      setCurrentPage(0);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    const newSearchTerm = { ...searchTerm, [name]: value };
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData({
      title: '', description: '', creationDate: new Date().toISOString().split('T')[0],
      category: 'PAINTING', artistId: artists.length > 0 ? artists[0].id : '', imgPath: ''
    });
    setFormMode('create');
    setCurrentArtwork(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (artwork) => {
    setFormData({
      title: artwork.title || '',
      description: artwork.description || '',
      creationDate: artwork.creationDate ? artwork.creationDate.split('T')[0] : new Date().toISOString().split('T')[0],
      category: artwork.category || 'PAINTING',
      artistId: artwork.artistId || '',
      imgPath: artwork.imgPath || ''
    });
    setFormMode('edit');
    setCurrentArtwork(artwork);
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    const artworkData = { ...formData };
    if (artworkData.artistId === '') artworkData.artistId = null;

    try {
      if (formMode === 'create') {
        await apiStore.apiClient.post('/artworks/add', artworkData);
      } else {
        await apiStore.apiClient.put(`/artworks/update?id=${currentArtwork.id}`, artworkData);
      }
      setShowModal(false);
      fetchArtworksData(formMode === 'create' ? 0 : currentPage, searchTerm);
    } catch (err) {
      setFormError('Ошибка: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (artworkId) => {
    if (window.confirm('Удалить это произведение?')) {
      setLoading(true);
      try {
        await apiStore.apiClient.delete(`/artworks/delete/${artworkId}`);
        fetchArtworksData(0, searchTerm);
      } catch (err) {
        setError('Ошибка удаления: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };
  
  const artCategories = ["PAINTING", "SCULPTURE", "PHOTOGRAPHY", "DIGITAL_ART", "INSTALLATION"];


  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Управление произведениями</h2>
          <Button variant="primary" onClick={openCreateModal}><FaPlus className="me-2" />Добавить</Button>
        </Card.Header>
        <Card.Body>
          <Form className="mb-3">
            <Row>
              <Col md={3}><FormControl placeholder="Название" name="title" value={searchTerm.title} onChange={handleSearchChange} /></Col>
              <Col md={3}><FormControl placeholder="Имя художника" name="artistName" value={searchTerm.artistName} onChange={handleSearchChange} /></Col>
              <Col md={3}>
                <Form.Select name="category" value={searchTerm.category} onChange={handleSearchChange}>
                  <option value="">Все категории</option>
                  {artCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Form.Select>
              </Col>
              {/* <Col md={2}><Button onClick={() => fetchArtworksData(0, searchTerm)}><FaSearch/> Поиск</Button></Col> */}
            </Row>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}
          {loading && artworks.length === 0 ? (
            <div className="text-center p-5"><div className="spinner-border"></div></div>
          ) : artworks.length === 0 && !loading ? (
            <Alert variant="info">Произведения не найдены.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th><th>Изобр.</th><th>Название</th><th>Художник</th><th>Категория</th><th>Дата созд.</th><th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {artworks.map(artwork => (
                  <tr key={artwork.id}>
                    <td>{artwork.id}</td>
                    <td>
                      {artwork.imgPath && <img src={artwork.imgPath} alt={artwork.title} style={{ width: '50px', height: '50px', objectFit: 'cover' }}/>}
                    </td>
                    <td>{artwork.title}</td>
                    <td>{artwork.artistName || 'N/A'}</td>
                    <td>{artwork.category}</td>
                    <td>{artwork.creationDate ? new Date(artwork.creationDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(artwork)}><FaEdit /></Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(artwork.id)}><FaTrash /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
           {totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.First onClick={() => handlePageChange(0)} disabled={currentPage === 0} />
              <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} />
              {[...Array(totalPages).keys()].map(page => (
                <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                  {page + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} />
              <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} />
            </Pagination>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{formMode === 'create' ? 'Добавить' : 'Редактировать'} произведение</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control type="text" name="title" value={formData.title} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Художник</Form.Label>
              <Form.Select name="artistId" value={formData.artistId} onChange={handleFormChange}>
                <option value="">Выберите художника (необязательно)</option>
                {artists.map(artist => <option key={artist.id} value={artist.id}>{artist.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleFormChange}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Дата создания</Form.Label>
              <Form.Control type="date" name="creationDate" value={formData.creationDate} onChange={handleFormChange} max={new Date().toISOString().split('T')[0]} required/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Категория</Form.Label>
              <Form.Select name="category" value={formData.category} onChange={handleFormChange} required>
                 {artCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL изображения</Form.Label>
              <Form.Control type="text" name="imgPath" value={formData.imgPath} onChange={handleFormChange} />
              {formData.imgPath && <Card.Img src={formData.imgPath} alt="Preview" className="mt-2" style={{ maxHeight: '200px', objectFit: 'contain' }} />}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
            <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminArtworks;
