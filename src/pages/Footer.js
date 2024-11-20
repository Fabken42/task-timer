import React from 'react';
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const AppFooter = () => (
  <footer className="bg-dark text-light py-3">
    <Container className="text-center">
      <p className="mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>
        Minhas redes:
      </p>
      <div className="d-flex justify-content-center gap-3 mb-3">
        <a
          href="https://www.instagram.com/fabricio_1512/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-light"
        >
          <FontAwesomeIcon className='social-media-icon' icon={faInstagram} size="2x" />
        </a>
        <a
          href="https://github.com/Fabken42"
          target="_blank"
          rel="noopener noreferrer"
          className="text-light"
        >
          <FontAwesomeIcon icon={faGithub} className='social-media-icon' size="2x" />
        </a>
        <a 
          href="https://www.linkedin.com/in/fabrício-kohatsu-7486a9279/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-light"
        >
          <FontAwesomeIcon icon={faLinkedin} className='social-media-icon' size="2x" />
        </a>
      </div>
      <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}>
        Email: <a href="mailto:fabken42@gmail.com" className="text-light">fabken42@gmail.com</a><br />
        Telefone: (11) 95381-8106
      </p>
    </Container>
  </footer>
);

export default AppFooter;
 