import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTaskIndex } from '../redux/taskSlice';
import { Howl } from 'howler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { Container, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import '../styles/TaskTimer.css';

let backgroundAudio = null;
let previewAudio = null;
let backgroundAudioPosition = 0;
let previewTimeout = null;

export default function TaskTimer() {
    const dispatch = useDispatch();
    const tasks = useSelector((state) => state.tasks.tasks);
    const currentTaskIndex = useSelector((state) => state.tasks.currentTaskIndex);
    const pendingTasks = tasks.filter((task) => !task.concluido);
    const task = pendingTasks[currentTaskIndex] || null;

    const [timeLeft, setTimeLeft] = useState(task ? Number(task.duration) * 60 : 0);
    const [isRunning, setIsRunning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [backgroundSound, setBackgroundSound] = useState('/audio/lofi01.mp3');
    const [endSound, setEndSound] = useState('/audio/bip01.mp3');
    const [volume, setVolume] = useState(0.5);

    useEffect(() => {
        setTimeLeft(task ? Number(task.duration) * 60 : 0);
    }, [task]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        } else if (timeLeft === 0 && isRunning) {
            playEndSound();
            handleNextTask();
        }
    }, [isRunning, timeLeft]);

    useEffect(() => {
        if (backgroundAudio) backgroundAudio.stop();

        backgroundAudio = new Howl({
            src: [backgroundSound],
            loop: true,
            volume,
        });

        if (isRunning) {
            backgroundAudio.seek(backgroundAudioPosition).play();
        }

        return () => {
            if (backgroundAudio) backgroundAudio.stop();
        };
    }, [isRunning, backgroundSound, volume]);

    const playPreview = (sound) => {
        if (previewAudio) previewAudio.stop();

        previewAudio = new Howl({
            src: [sound],
            volume,
        });

        previewAudio.play();

        if (previewTimeout) clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => {
            previewAudio.stop();
            previewTimeout = null;
        }, 5000);
    };

    const handleTogglePause = () => {
        setIsRunning((prev) => {
            if (prev && backgroundAudio) {
                backgroundAudioPosition = backgroundAudio.seek();
                backgroundAudio.pause();
            } else if (!prev && backgroundAudio) {
                backgroundAudio.seek(backgroundAudioPosition).play();
            }
            return !prev;
        });
    };

    const handleNextTask = () => {
        const nextIndex = (currentTaskIndex + 1) % pendingTasks.length;
        dispatch(setCurrentTaskIndex(nextIndex));
        setIsRunning(false);
    };

    const playEndSound = () => {
        new Howl({
            src: [endSound],
            volume,
        }).play();
    };

    return (
        <Container className="task-timer-container">
            <h4 className="task-title">{task?.name}</h4>
            <p className="task-objective">{task?.objective}</p>
            <div className="time-display">
                Tempo Restante: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            <Row className="control-buttons">
                <Col>
                    <Button variant={isRunning ? "warning" : "success"} onClick={handleTogglePause}>
                        {isRunning ? 'Pause' : 'Play'}
                    </Button>
                </Col>
                <Col>
                    <Button variant="primary" onClick={handleNextTask}>Pular</Button>
                </Col>
            </Row>
            <FontAwesomeIcon 
                icon={faMusic} 
                className="audio-icon" 
                onClick={() => {
                    if (isRunning) setIsRunning(false);
                    setShowModal(true);
                }}
            />

            {/* Modal para configurações de áudio */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Configurações de Áudio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="backgroundSound">
                            <Form.Label>Som de Fundo</Form.Label>
                            <Form.Control as="select" value={backgroundSound} onChange={(e) => {
                                const selectedSound = e.target.value;
                                setBackgroundSound(selectedSound);
                                playPreview(selectedSound);
                            }}>
                                <option value="/audio/lofi01.mp3">Lo-fi 01</option>
                                <option value="/audio/lofi02.mp3">Lo-fi 02</option>
                                <option value="/audio/lofi03.mp3">Lo-fi 03</option>
                                <option value="/audio/lofi04.mp3">Lo-fi 04</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="endSound">
                            <Form.Label>Som de Alerta</Form.Label>
                            <Form.Control as="select" value={endSound} onChange={(e) => {
                                const selectedSound = e.target.value;
                                setEndSound(selectedSound);
                                playPreview(selectedSound);
                            }}>
                                <option value="/audio/bip01.mp3">Alerta 01</option>
                                <option value="/audio/bip02.mp3">Alerta 02</option>
                                <option value="/audio/bip03.mp3">Alerta 03</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="volume">
                            <Form.Label>Volume</Form.Label>
                            <Form.Control 
                                className="volume-slider"
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={volume} 
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value));
                                    if (previewAudio) previewAudio.volume(e.target.value);
                                }} 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
