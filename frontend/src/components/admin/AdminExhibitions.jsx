import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Alert, Card, Pagination, Row, Col, FormControl } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import apiStore from '../../stores/ApiStore';
import { debounce } from 'lodash';

const AdminExhibitions = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [allArtworks, setAllArtworks] = useState([]); // Для мультиселекта
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [currentExhibition, setCurrentExhibition] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', startDate: '', endDate: '',
    location: '', price: 0, imagePath: '', artworkIds: []
  });
  const [formMode, setFormMode] = useState('create');

  const [searchTerm, setSearchTerm] = useState({ title: '', location: '' });
  const [isSearching, setIsSearching] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];

  const fetchExhibitionsData = useCallback(async (page, searchPayload) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      const cleanedSearchPayload = Object.fromEntries(
        Object.entries(searchPayload).filter(([_, v]) => v !== '')
      );
      if (isSearching && Object.keys(cleanedSearchPayload).length > 0) {
        data = await apiStore.searchExhibitions(cleanedSearchPayload, page, pageSize);
      } else {
        data = await apiStore.fetchExhibitions(page, pageSize);
      }
      setExhibitions(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.number || 0);
    } catch (err) {
      setError('Ошибка загрузки выставок: ' + (err.message || 'Неизвестная ошибка'));
      setExhibitions([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize, isSearching]);

  const fetchAllArtworksForSelect = async () => {
    try {
      const artworksData = await apiStore.fetchAllArtworks(); // Используем новый метод из ApiStore
      setAllArtworks(artworksData || []);
    } catch (err) {
      console.error("Ошибка загрузки всех произведений:", err);
      setAllArtworks([]);
    }
  };

  useEffect(() => {
    fetchExhibitionsData(currentPage, searchTerm);
  }, [fetchExhibitionsData, currentPage, searchTerm]);

  useEffect(() => {
    fetchAllArtworksForSelect(); // Загружаем один раз
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

  const handleArtworksChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({ ...prev, artworkIds: selectedIds }));
  };
  
  const defaultEndDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  };

  const openCreateModal = () => {
    setFormData({
      title: '', description: '', startDate: today, endDate: defaultEndDate(),
      location: '', price: 0, imagePath: '', artworkIds: []
    });
    setFormMode('create');
    setCurrentExhibition(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (exhibition) => {
    setFormData({
      title: exhibition.title || '',
      description: exhibition.description || '',
      startDate: exhibition.startDate ? exhibition.startDate.split('T')[0] : today,
      endDate: exhibition.endDate ? exhibition.endDate.split('T')[0] : defaultEndDate(),
      location: exhibition.location || '',
      price: exhibition.price || 0,
      imagePath: exhibition.imagePath || '',
      artworkIds: exhibition.artworkIds || []
    });
    setFormMode('edit');
    setCurrentExhibition(exhibition);
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    // Убедимся, что price это число
    const dataToSubmit = { ...formData, price: parseFloat(formData.price) };

    try {
      if (formMode === 'create') {
        await apiStore.apiClient.post('/exhibitions/add', dataToSubmit);
      } else {
        await apiStore.apiClient.put(`/exhibitions/update?id=${currentExhibition.id}`, dataToSubmit);
      }
      setShowModal(false);
      fetchExhibitionsData(formMode === 'create' ? 0 : currentPage, searchTerm);
    } catch (err) {
      setFormError('Ошибка: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (exhibitionId) => {
    if (window.confirm('Удалить эту выставку?')) {
      setLoading(true);
      try {
        await apiStore.apiClient.delete(`/exhibitions/delete/${exhibitionId}`);
        fetchExhibitionsData(0, searchTerm);
      } catch (err) {
        setError('Ошибка удаления: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Управление выставками</h2>
          <Button variant="primary" onClick={openCreateModal}><FaPlus className="me-2" />Добавить</Button>
        </Card.Header>
        <Card.Body>
          <Form className="mb-3">
            <Row>
              <Col md={5}><FormControl placeholder="Название" name="title" value={searchTerm.title} onChange={handleSearchChange} /></Col>
              <Col md={5}><FormControl placeholder="Место проведения" name="location" value={searchTerm.location} onChange={handleSearchChange} /></Col>
              {/* <Col md={2}><Button onClick={() => fetchExhibitionsData(0, searchTerm)}><FaSearch /> Поиск</Button></Col> */}
            </Row>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}
          {loading && exhibitions.length === 0 ? (
            <div className="text-center p-5"><div className="spinner-border"></div></div>
          ) : exhibitions.length === 0 && !loading ? (
            <Alert variant="info">Выставки не найдены.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th><th>Название</th><th>Место</th><th>Начало</th><th>Конец</th><th>Цена</th><th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {exhibitions.map(ex => (
                  <tr key={ex.id}>
                    <td>{ex.id}</td><td>{ex.title}</td><td>{ex.location}</td>
                    <td>{ex.startDate ? new Date(ex.startDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{ex.endDate ? new Date(ex.endDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{ex.price}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(ex)}><FaEdit /></Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(ex.id)}><FaTrash /></Button>
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
          <Modal.Title>{formMode === 'create' ? 'Добавить' : 'Редактировать'} выставку</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control type="text" name="title" value={formData.title} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleFormChange}/>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата начала</Form.Label>
                  <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleFormChange} required min={today}/>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата окончания</Form.Label>
                  <Form.Control type="date" name="endDate" value={formData.endDate} onChange={handleFormChange} required min={formData.startDate || today}/>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Место проведения</Form.Label>
              <Form.Control type="text" name="location" value={formData.location} onChange={handleFormChange} required/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Цена билета (₽)</Form.Label>
              <Form.Control type="number" name="price" value={formData.price} onChange={handleFormChange} required min="0" step="0.01"/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL изображения (imagePath)</Form.Label>
              <Form.Control type="text" name="imagePath" value={formData.imagePath} onChange={handleFormChange} />
              {formData.imagePath && <Card.Img src={formData.imagePath} alt="Preview" className="mt-2" style={{ maxHeight: '200px', objectFit: 'contain' }} />}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Произведения (Ctrl+Click для выбора нескольких)</Form.Label>
              <Form.Select multiple name="artworkIds" value={formData.artworkIds} onChange={handleArtworksChange} style={{ height: '150px' }}>
                {allArtworks.map(art => <option key={art.id} value={art.id}>{art.title}</option>)}
              </Form.Select>
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

export default AdminExhibitions;
