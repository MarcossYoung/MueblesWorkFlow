import React, {useState, useRef, useEffect} from 'react';
import axios from 'axios';
import {useLocation} from 'react-router-dom';
import '../css/styles.css';

const N8N_WEBHOOK_URL =
	'https://primary-production-340f.up.railway.app/webhook-test/chat';

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
			// IMPORTANTE: El body { message: ... } debe coincidir con lo que esperas en n8n
			const response = await axios.post(N8N_WEBHOOK_URL, {
				message: userMsg.text,
			});

			// 3. Procesar respuesta de n8n
			// n8n suele devolver la respuesta del último nodo.
			// Si el agente devuelve texto plano o un JSON, ajústalo aquí.
			// Generalmente el agente devuelve: { output: "Texto..." } o similar.
			const botResponseText =
				response.data.output ||
				response.data.text ||
				JSON.stringify(response.data);

			const botMsg = {text: botResponseText, sender: 'bot'};
			setMessages((prev) => [...prev, botMsg]);
		} catch (error) {
			console.error('Error chatbot:', error);
			setMessages((prev) => [
				...prev,
				{text: 'Ups, me dormí. Intenta de nuevo.', sender: 'bot'},
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
