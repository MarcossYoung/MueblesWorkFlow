import React, {useState, useRef, useEffect} from 'react';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // Necesitarás instalar: npm install uuid
import '../css/styles.css';

const N8N_WEBHOOK_URL =
	'https://n8n-production-f545f.up.railway.app/webhook/chat';

const Chatbot = () => {
	const [isOpen, setIsOpen] = useState(false);

	// 1. ESTADO PARA EL SESSION ID
	const [sessionId] = useState(() => {
		// Intentamos recuperar uno existente o creamos uno nuevo
		const savedId = localStorage.getItem('chatbot_session_id');
		if (savedId) return savedId;
		const newId = uuidv4();
		localStorage.setItem('chatbot_session_id', newId);
		return newId;
	});

	const [messages, setMessages] = useState([
		{
			text: 'Hola 👋 Soy tu CFO Virtual. ¿En qué te ayudo hoy? Podemos ver reportes financieros o analisis de logistica y pedidos.',
			sender: 'bot',
		},
	]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);

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

		const userMsg = {text: input, sender: 'user'};
		setMessages((prev) => [...prev, userMsg]);
		setInput('');
		setLoading(true);

		try {
			// 2. ENVIAR A N8N CON SESSIONID
			const response = await axios.post(N8N_WEBHOOK_URL, {
				message: userMsg.text,
				sessionId: sessionId, // <--- Enviamos el ID persistente
			});

			console.log('Respuesta de n8n:', response.data);

			let botText = '';

			if (Array.isArray(response.data)) {
				botText =
					response.data[0]?.output || JSON.stringify(response.data);
			} else if (response.data && response.data.output) {
				botText = response.data.output;
			} else {
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

	return (
		<div className='chatbot-wrapper'>
			<button
				className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? '✕' : '💬'}
			</button>

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
