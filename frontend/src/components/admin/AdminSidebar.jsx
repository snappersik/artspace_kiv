import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaPaintBrush, FaUserAlt, FaCalendarAlt } from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <Nav className="flex-column sidebar-sticky py-4">
      <div className="sidebar-header pb-3 mb-3 text-center text-white">
        <h4>Админ-панель</h4>
      </div>
      
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/admin" 
          className={`text-white ${currentPath === '/admin' ? 'active' : ''}`}
        >
          <FaHome className="me-2" /> Дашборд
        </Nav.Link>
      </Nav.Item>
      
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/admin/users" 
          className={`text-white ${currentPath === '/admin/users' ? 'active' : ''}`}
        >
          <FaUsers className="me-2" /> Пользователи
        </Nav.Link>
      </Nav.Item>
      
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/admin/artworks" 
          className={`text-white ${currentPath === '/admin/artworks' ? 'active' : ''}`}
        >
          <FaPaintBrush className="me-2" /> Произведения
        </Nav.Link>
      </Nav.Item>
      
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/admin/artists" 
          className={`text-white ${currentPath === '/admin/artists' ? 'active' : ''}`}
        >
          <FaUserAlt className="me-2" /> Художники
        </Nav.Link>
      </Nav.Item>
      
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/admin/exhibitions" 
          className={`text-white ${currentPath === '/admin/exhibitions' ? 'active' : ''}`}
        >
          <FaCalendarAlt className="me-2" /> Выставки
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default AdminSidebar;
