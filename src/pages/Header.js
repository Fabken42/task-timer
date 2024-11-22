import React from 'react';
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

//diminuir tamanho do icone faClock

const Header = () => (
    <header className="bg-light border-bottom pt-3">
        <Container className="text-center">
            <h1 className="mb-2 title">
                <FontAwesomeIcon icon={faClock} size="xs"/>
                <strong className='mx-2'>TASK TIMER</strong>
                <FontAwesomeIcon icon={faClock}  size="xs"/>
            </h1>
            <p className="text-muted site-description">
                Organize suas tarefas e controle seu tempo para aumentar a produtividade!
            </p>
        </Container>
    </header>
);

export default Header;
