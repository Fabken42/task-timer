import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTaskIndex, toggleConcluido, toggleIsRunning } from '../redux/taskSlice';
import { Howl } from 'howler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { Container, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import '../styles/TaskTimer.css';

let backgroundAudio = null;
let previewAudio = null;
let backgroundAudioPosition = 0;
let previewTimeout = null;
const PREVIEW_DURATION = 5000;

export default function TaskTimer() {
    const dispatch = useDispatch();
    const isRunning = useSelector((state) => state.tasks.isRunning);
    const tasks = useSelector((state) => state.tasks.tasks);
    const currentTaskIndex = useSelector((state) => state.tasks.currentTaskIndex);
    const task = tasks[currentTaskIndex] || null;

    const [timeLeft, setTimeLeft] = useState(task ? Number(task.duration) * 60 : 0);
    const [showAudioModal, setShowAudioModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
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
        } else if (timeLeft <= 0 && isRunning) {
            playEndSound();
            if (backgroundAudio) {
                backgroundAudioPosition = backgroundAudio.seek(); // Salva a posição atual do áudio
                backgroundAudio.pause(); // Pausa o áudio de fundo
            }
            setShowConfirmationModal(true); // Exibir modal de confirmação ao terminar a tarefa
        }
    }, [isRunning, timeLeft]);

    useEffect(() => {
        if (timeLeft > 0 && task) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = String(timeLeft % 60).padStart(2, '0');
            document.title = `${minutes}:${seconds} - Task Timer`;
        } else if (timeLeft <= 0 && task) {
            document.title = `Tempo esgotado - Task Timer`;
        } else {
            document.title = 'Task Timer';
        }
    }, [timeLeft, task]);

    useEffect(() => {
        if (backgroundAudio) {
            backgroundAudio.stop();
            backgroundAudio = null;
        }
    
        if (backgroundSound) { // Apenas inicializa se houver um som válido
            backgroundAudio = new Howl({
                src: [backgroundSound],
                loop: true,
                volume,
            });
    
            if (isRunning) {
                backgroundAudio.seek(backgroundAudioPosition || 0).play();
            }
        }
    
        return () => {
            if (backgroundAudio) {
                backgroundAudio.stop();
            }
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
        }, PREVIEW_DURATION);
    };

    const handleTogglePause = () => {
        if (!task) return;
    
        if (isRunning) {
            if (backgroundAudio && backgroundAudio.playing()) {
                backgroundAudioPosition = backgroundAudio.seek() || 0;
                backgroundAudio.pause();
            }
        } else {
            if (backgroundAudio) {
                backgroundAudio.seek(backgroundAudioPosition || 0).play();
            }
        }
    
        dispatch(toggleIsRunning(!isRunning)); // Alterna o estado
    };
     

    const handleNextTask = () => {
        if (backgroundAudio) {
            backgroundAudioPosition = backgroundAudio.seek(); // Salva a posição atual do áudio
            backgroundAudio.pause(); // Pausa o áudio de fundo
        }
        setShowConfirmationModal(true); // Exibir modal de confirmação ao pular a tarefa
    };

    const playEndSound = () => {
        new Howl({
            src: [endSound],
            volume,
        }).play();
    };

    const handleOpenAudioModal = () => {
        if (backgroundAudio) {
            backgroundAudioPosition = backgroundAudio.seek();
            backgroundAudio.pause();
        }
        dispatch(toggleIsRunning(false)); // Pausa o timer
        setShowAudioModal(true);
    };

    const handleCloseAudioModal = () => {
        setShowAudioModal(false);
        if (isRunning && backgroundAudio) {
            backgroundAudio.seek(backgroundAudioPosition).play();
        }
    };

    const markTaskAsCompleted = () => {
        moveToNextPendingTask();
        if (!task) return;
        if (!task.concluido) dispatch(toggleConcluido(task.position));
    };

    const markTaskAsPending = () => {
        moveToNextPendingTask();
        if (!task) return;
        if (task.concluido) dispatch(toggleConcluido(task.position));
    };

    const moveToNextPendingTask = () => {
        const nextPendingIndex = tasks.findIndex((t, idx) => idx > currentTaskIndex && !t.concluido);
        const newIndex = nextPendingIndex !== -1 ? nextPendingIndex : tasks.findIndex((t) => !t.concluido);
        if (newIndex !== -1) {
            dispatch(setCurrentTaskIndex(newIndex));
        }
        backgroundAudioPosition = 0;
        setShowConfirmationModal(false);
        dispatch(toggleIsRunning(false)); // Pausa o timer
    };

    return (
        <Container fluid className={`text-center p-4 mt-5 task-timer-container ${task?.concluido ? 'concluido' : 'pendente'
            }`}>
            <FontAwesomeIcon
                title='Configurações'
                icon={faCog}
                className="audio-icon"
                onClick={handleOpenAudioModal}
            />

            <h4 className="task-title">{task?.position}. {task?.name.charAt(0).toUpperCase() + task?.name.slice(1) || ''}</h4>
            <p className="task-objective">{task?.objective}</p>
            <div className="time-display">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            <Row className="control-buttons">
                <Col xs={6}>
                    <Button className={`btn-lg w-100 ${isRunning ? "btn-pausar" : "btn-comecar"}`} onClick={handleTogglePause} disabled={!task}>
                        {isRunning ? 'Pausar' : 'Começar'}
                    </Button>
                </Col>
                <Col xs={6}>
                    <Button className='btn-lg w-100 skip-btn' onClick={handleNextTask}>Pular</Button>
                </Col>
            </Row>

            {/* Modal para configurações de áudio */}
            <Modal show={showAudioModal} onHide={handleCloseAudioModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Configurações de Áudio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Seletor de som de fundo */}
                        <Form.Group controlId="backgroundSound">
                            <Form.Label>Som de Fundo:</Form.Label>
                            <Form.Control as="select" value={backgroundSound} onChange={(e) => {
                                const selectedSound = e.target.value;
                                setBackgroundSound(selectedSound);
                                playPreview(selectedSound);
                            }}>
                                <option value=''>Nenhum</option>
                                <option value="/audio/rain.mp3">Som de Chuva</option>
                                <option value="/audio/conversa.mp3">Pessoas Conversando</option>
                                <option value="/audio/lofi01.mp3">Jinsei (lofi)</option>
                                <option value="/audio/lofi02.mp3">Satisfying (lofi)</option>
                                <option value="/audio/lofi03.mp3">Tasty (lofi)</option>
                                <option value="/audio/lofi04.mp3">Good Night (lofi)</option>
                            </Form.Control>
                        </Form.Group>

                        {/* Seletor de som de alerta */}
                        <Form.Group controlId="endSound">
                            <Form.Label className='mt-3'>Som de Alerta:</Form.Label>
                            <Form.Control as="select" value={endSound} onChange={(e) => {
                                const selectedSound = e.target.value;
                                setEndSound(selectedSound);
                                playPreview(selectedSound);
                            }}>
                                <option value="">Nenhum</option>
                                <option value="/audio/bip01.mp3">Simples</option>
                                <option value="/audio/bip02.mp3">Level Up</option>
                                <option value="/audio/bip03.mp3">Perigo</option>
                                <option value="/audio/bip04.mp3">Alerta</option>
                                <option value="/audio/bip05.mp3">Notificação</option>
                            </Form.Control>
                        </Form.Group>

                        {/* Controle de volume */}
                        <Form.Group controlId="volume">
                            <Form.Label className='mt-3'>Volume:</Form.Label>
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
                    <Button variant="secondary" className="rounded-pill" onClick={handleCloseAudioModal}>Fechar</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmação de tarefa */}
            <Modal show={showConfirmationModal} onHide={() => {
                setShowConfirmationModal(false);
                moveToNextPendingTask();
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Status da Tarefa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Você concluiu a tarefa?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" className="rounded-pill" onClick={markTaskAsCompleted}>Concluído</Button>
                    <Button variant="warning" className="rounded-pill" onClick={markTaskAsPending}>Pendente</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
