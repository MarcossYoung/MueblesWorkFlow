import React, {useState, useRef, useEffect} from 'react';
import axios from 'axios';
import {useLocation} from 'react-router-dom';
import '../css/styles.css';

const N8N_WEBHOOK_URL =
	'https://n8n-production-f545f.up.railway.app/webhook/chatt';

const Chatbot = () => {
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([
		{
			text: 'Hola 👋 Soy tu CFO Virtual. ¿En qué te ayudo hoy?',
			sender: 'bot',
		},
	]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);

	// Referencia para autoscroll al fondo
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isOpen]);

	const sendMessage = async (e) => {
		e.preventDefault();
		if (!input.trim()) return;

		// 1. Agregar mensaje del usuario
		const userMsg = {text: input, sender: 'user'};
		setMessages((prev) => [...prev, userMsg]);
		setInput('');
		setLoading(true);

		try {
			// 2. Enviar a n8n
			const response = await axios.post(N8N_WEBHOOK_URL, {
				message: userMsg.text,
			});

			console.log('Respuesta cruda de n8n:', response.data); // Para debuggear en consola

			// 3. LIMPIEZA DE DATOS (La parte clave)
			let botText = '';

			// Caso A: n8n devuelve un Array (común en modo Test)
			if (Array.isArray(response.data)) {
				botText =
					response.data[0]?.output || JSON.stringify(response.data);
			}
			// Caso B: n8n devuelve un Objeto limpio (lo que configuramos en Paso 1)
			else if (response.data && response.data.output) {
				botText = response.data.output;
			}
			// Caso C: Fallback (por si acaso)
			else {
				botText =
					typeof response.data === 'string'
						? response.data
						: JSON.stringify(response.data);
			}

			const botMsg = {text: botText, sender: 'bot'};
			setMessages((prev) => [...prev, botMsg]);
		} catch (error) {
			console.error('Error chatbot:', error);
			setMessages((prev) => [
				...prev,
				{text: 'Ups, hubo un error de conexión.', sender: 'bot'},
			]);
		} finally {
			setLoading(false);
		}
	};

	const hiddenRoutes = ['/login', '/register'];

	if (hiddenRoutes.includes(location.pathname)) {
		return null;
	}

	return (
		<div className='chatbot-wrapper'>
			{/* Botón Flotante */}
			<button
				className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? '✕' : '💬'}
			</button>

			{/* Ventana del Chat */}
			{isOpen && (
				<div className='chatbot-window'>
					<div className='chatbot-header'>
						<h3>Asistente Financiero</h3>
						<span className='status-dot'></span>
					</div>

					<div className='chatbot-messages'>
						{messages.map((msg, index) => (
							<div
								key={index}
								className={`message ${msg.sender}`}
							>
								{/* Renderizamos HTML por si n8n manda <b> o <br> en el reporte */}
								<div
									className='message-content'
									dangerouslySetInnerHTML={{
										__html: msg.text.replace(
											/\n/g,
											'<br />',
										),
									}}
								/>
							</div>
						))}
						{loading && (
							<div className='message bot'>
								<div className='typing-indicator'>
									<span></span>
									<span></span>
									<span></span>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>

					<form onSubmit={sendMessage} className='chatbot-input-area'>
						<input
							type='text'
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder='Escribe aquí...'
							disabled={loading}
						/>
						<button
							type='submit'
							disabled={loading || !input.trim()}
						>
							➤
						</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default Chatbot;
