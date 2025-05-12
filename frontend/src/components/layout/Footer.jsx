import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <div className="row">
          <div className="col-md-6">
            <h5>Центр Современного Искусства</h5>
            <p>Место, где искусство оживает</p>
          </div>
          <div className="col-md-3">
            <h5>Ссылки</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white">Главная</a></li>
              <li><a href="/exhibitions" className="text-white">Выставки</a></li>
              <li><a href="/artists" className="text-white">Художники</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5>Контакты</h5>
            <address>
              <p>ул. Искусства, 123<br />
              Город, 123456<br />
              Телефон: (123) 456-7890</p>
            </address>
          </div>
        </div>
        <div className="text-center mt-3">
          <p>&copy; {new Date().getFullYear()} Центр Современного Искусства. Все права защищены.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
