import React, {useState, useEffect, useContext} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {BASE_URL} from '../api/config';
import {UserContext} from '../UserProvider';

const ProductDetail = () => {
	const {productId} = useParams();
	const {user} = useContext(UserContext);

	// --- ESTADOS ---
	const [loading, setLoading] = useState(true);
	const [types, setTypes] = useState([]);
	const [statuses, setStatuses] = useState([]);
	const [payments, setPayments] = useState([]);

	// Feedback
	const [successMsg, setSuccessMsg] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	// Estado del Producto
	const [product, setProduct] = useState({
		titulo: '',
		productType: '',
		medidas: '',
		material: '',
		pintura: '',
		laqueado: '',
		color: '',
		precio: 0,
		cantidad: 1,
		startDate: '',
		fechaEstimada: '',
		fechaEntrega: '',
		notas: '',
		workOrderStatus: '',
		daysLate: 0,
	});

	// Estado Nuevo Pago
	const [newPayment, setNewPayment] = useState({
		valor: '',
		type: 'DEPOSIT',
		pagostatus: 'SEÑA',
	});

	// Permisos
	const canSeeFinancials = user?.role === 'ADMIN' || user?.role === 'SELLER';

	// --- CARGA DE DATOS ---
	useEffect(() => {
		const loadData = async () => {
			try {
				// Usamos Promise.all para cargar todo junto
				const [prodRes, typesRes, statusRes, paymentsRes] =
					await Promise.all([
						axios.get(`${BASE_URL}/api/products/${productId}`),
						axios.get(`${BASE_URL}/api/products/types`),
						axios.get(`${BASE_URL}/api/workorders/statuses`),
						// Usamos un catch aquí para que si falla pagos (404) no rompa todo
						axios
							.get(`${BASE_URL}/api/payments/${productId}`)
							.catch(() => ({data: []})),
					]);

				// Mapeo seguro del producto
				setProduct({
					...prodRes.data,
					productType:
						prodRes.data.productType || prodRes.data.type || '',
					workOrderStatus:
						prodRes.data.workOrderStatus ||
						prodRes.data.status ||
						'',
					// Aseguramos que daysLate venga del backend o sea 0
					daysLate: prodRes.data.daysLate || 0,
				});

				setTypes(typesRes.data);
				setStatuses(statusRes.data);

				// Mapeo seguro de pagos (Array vs Objeto)
				const dataPagos = paymentsRes.data;
				if (Array.isArray(dataPagos)) {
					setPayments(dataPagos);
				} else if (dataPagos && typeof dataPagos === 'object') {
					setPayments([dataPagos]); // Convertir objeto único a array
				} else {
					setPayments([]);
				}
			} catch (err) {
				console.error('Error loading data', err);
				setErrorMsg('Error al cargar los datos del pedido.');
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [productId]);

	// --- HANDLERS ---
	const handleChange = (e) => {
		setProduct({...product, [e.target.name]: e.target.value});
	};

	const handleSaveProduct = async (e) => {
		e.preventDefault();
		setSuccessMsg('');
		setErrorMsg('');
		try {
			const token = localStorage.getItem('token');
			await axios.put(`${BASE_URL}/api/products/${productId}`, product, {
				headers: {Authorization: `Bearer ${token}`},
			});
			setSuccessMsg('✅ Producto actualizado correctamente');
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (err) {
			setErrorMsg('❌ Error al guardar cambios');
		}
	};

	const handleAddPayment = async () => {
		if (!newPayment.valor) return;
		try {
			const token = localStorage.getItem('token');
			const res = await axios.post(
				`${BASE_URL}/api/payments`,
				{
					...newPayment,
					product_id: productId,
					fecha: new Date().toISOString().split('T')[0],
				},
				{
					headers: {Authorization: `Bearer ${token}`},
				}
			);

			// Actualizamos la lista visualmente
			setPayments([...payments, res.data]);
			setNewPayment({...newPayment, valor: ''});
			setSuccessMsg('✅ Pago registrado');
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (err) {
			setErrorMsg('Error al registrar pago');
		}
	};

	// --- CALCULOS SEGUROS ---
	const totalPaid = Array.isArray(payments)
		? payments.reduce(
				(acc, curr) => acc + Number(curr.valor || curr.amount || 0),
				0
		  )
		: 0;

	const balance = (product.precio || 0) - totalPaid;

	if (loading)
		return (
			<div style={{padding: '50px', textAlign: 'center'}}>
				Cargando...
			</div>
		);

	return (
		<div
			style={{
				padding: '30px',
				maxWidth: '1200px',
				margin: '0 auto',
				color: '#2d3436',
				fontFamily: 'system-ui, -apple-system, sans-serif',
			}}
		>
			<h1
				style={{
					marginBottom: '20px',
					fontSize: '1.8rem',
					fontWeight: '700',
				}}
			>
				Detalle del Pedido #{productId}
			</h1>

			{/* MENSAJES DE FEEDBACK */}
			{successMsg && (
				<div
					style={{
						padding: '15px',
						background: '#00b894',
						color: 'white',
						borderRadius: '5px',
						marginBottom: '20px',
					}}
				>
					{successMsg}
				</div>
			)}
			{errorMsg && (
				<div
					style={{
						padding: '15px',
						background: '#d63031',
						color: 'white',
						borderRadius: '5px',
						marginBottom: '20px',
					}}
				>
					{errorMsg}
				</div>
			)}

			{/* --- LAYOUT PRINCIPAL (GRID) --- */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1.5fr 1fr', // La proporción exacta de la imagen 1
					gap: '30px',
					alignItems: 'start',
				}}
			>
				{/* === COLUMNA IZQUIERDA: FORMULARIO === */}
				<div
					style={{
						background: 'white',
						padding: '25px',
						borderRadius: '10px',
						boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
					}}
				>
					<h3
						style={{
							borderBottom: '1px solid #eee',
							paddingBottom: '10px',
							marginBottom: '20px',
						}}
					>
						Datos del Mueble
					</h3>

					<form onSubmit={handleSaveProduct}>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '15px',
							}}
						>
							{/* Título (Ancho completo) */}
							<div style={{gridColumn: '1 / -1'}}>
								<label style={labelStyle}>Título</label>
								<input
									name='titulo'
									value={product.titulo}
									onChange={handleChange}
									style={inputStyle}
								/>
							</div>

							{/* Selects y Datos */}
							<div>
								<label style={labelStyle}>Tipo</label>
								<select
									name='productType'
									value={product.productType}
									onChange={handleChange}
									style={inputStyle}
								>
									{types.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</div>

							<div>
								<label style={labelStyle}>Estado</label>
								<select
									name='workOrderStatus'
									value={product.workOrderStatus}
									onChange={handleChange}
									style={inputStyle}
								>
									{statuses.map((s) => (
										<option key={s} value={s}>
											{s}
										</option>
									))}
								</select>
							</div>

							<div>
								<label style={labelStyle}>Material</label>
								<input
									name='material'
									value={product.material}
									onChange={handleChange}
									style={inputStyle}
								/>
							</div>

							<div>
								<label style={labelStyle}>Color</label>
								<input
									name='color'
									value={product.color}
									onChange={handleChange}
									style={inputStyle}
								/>
							</div>

							<div>
								<label style={labelStyle}>Medidas</label>
								<input
									name='medidas'
									value={product.medidas}
									onChange={handleChange}
									style={inputStyle}
								/>
							</div>

							<div>
								<label style={labelStyle}>Pintura</label>
								<input
									name='pintura'
									value={product.pintura}
									onChange={handleChange}
									style={inputStyle}
								/>
							</div>

							<div>
								<label style={labelStyle}>Laqueado</label>
								<input
									name='laqueado'
									value={product.laqueado}
									onChange={handleChange}
									style={inputStyle}
								/>
							</div>

							<div>
								<label style={labelStyle}>Cantidad</label>
								<input
									type='number'
									name='cantidad'
									value={product.cantidad}
									onChange={handleChange}
									style={inputStyle}
								/>
							</div>

							{/* Fechas */}
							<div>
								<label style={labelStyle}>Inicio</label>
								<input
									type='date'
									name='startDate'
									value={product.startDate}
									onChange={handleChange}
									style={inputStyle}
								/>
							</div>

							<div>
								<label style={labelStyle}>
									Entrega Estimada
								</label>
								<input
									type='date'
									name='fechaEstimada'
									value={product.fechaEstimada}
									onChange={handleChange}
									style={inputStyle}
								/>
							</div>

							<div style={{gridColumn: '1 / -1'}}>
								<label style={labelStyle}>
									Fecha de Entrega Real (Opcional)
								</label>
								<input
									type='date'
									name='fechaEntrega'
									value={product.fechaEntrega}
									onChange={handleChange}
									style={{...inputStyle, width: '50%'}}
								/>
							</div>

							{/* Precio (Solo Admin/Seller) - Integrado en el form */}
							{canSeeFinancials && (
								<div style={{gridColumn: '1 / -1'}}>
									<label
										style={{
											...labelStyle,
											color: '#0984e3',
										}}
									>
										Precio Total ($)
									</label>
									<input
										type='number'
										name='precio'
										value={product.precio}
										onChange={handleChange}
										style={{
											...inputStyle,
											fontWeight: 'bold',
											fontSize: '1.1rem',
											borderColor: '#0984e3',
										}}
									/>
								</div>
							)}

							{/* Notas */}
							<div style={{gridColumn: '1 / -1'}}>
								<label style={labelStyle}>Notas</label>
								<textarea
									name='notas'
									value={product.notas}
									onChange={handleChange}
									rows='3'
									style={{
										...inputStyle,
										fontFamily: 'inherit',
									}}
								/>
							</div>

							{/* Alerta de Demora */}
							{product.daysLate > 0 && (
								<div
									style={{
										gridColumn: '1 / -1',
										padding: '12px',
										background: '#ffeaa7',
										color: '#d35400',
										borderRadius: '5px',
										textAlign: 'center',
										fontWeight: 'bold',
									}}
								>
									⚠️{' '}
									{product.workOrderStatus === 'TERMINADO'
										? `Lleva ${product.daysLate} días en depósito sin retirar.`
										: `Tiene ${product.daysLate} días de retraso.`}
								</div>
							)}
						</div>

						<button
							type='submit'
							style={{
								marginTop: '25px',
								width: '100%',
								background: '#0984e3',
								color: 'white',
								border: 'none',
								padding: '12px',
								borderRadius: '5px',
								fontWeight: '600',
								fontSize: '1rem',
								cursor: 'pointer',
							}}
						>
							Guardar Cambios
						</button>
					</form>
				</div>

				{/* === COLUMNA DERECHA: FINANZAS === */}
				{canSeeFinancials && (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '20px',
						}}
					>
						{/* 1. Tarjeta Nuevo Pago (Gris) */}
						<div
							style={{
								background: '#f1f2f6',
								padding: '25px',
								borderRadius: '10px',
								border: '1px solid #dfe6e9',
							}}
						>
							<h3
								style={{marginBottom: '15px', color: '#2d3436'}}
							>
								Registrar Pago
							</h3>

							<div style={{marginBottom: '10px'}}>
								<input
									type='number'
									placeholder='Monto'
									value={newPayment.valor}
									onChange={(e) =>
										setNewPayment({
											...newPayment,
											valor: e.target.value,
										})
									}
									style={inputStyle}
								/>
							</div>

							<div style={{marginBottom: '15px'}}>
								<select
									value={newPayment.type}
									onChange={(e) =>
										setNewPayment({
											...newPayment,
											type: e.target.value,
										})
									}
									style={inputStyle}
								>
									<option value='DEPOSIT'>Seña</option>
									<option value='RESTO'>Saldo</option>
									<option value='EXTRA'>Extra</option>
								</select>
							</div>

							<button
								onClick={handleAddPayment}
								style={{
									width: '100%',
									background: '#00b894',
									color: 'white',
									border: 'none',
									padding: '10px',
									borderRadius: '5px',
									fontWeight: '600',
									cursor: 'pointer',
								}}
							>
								+ Agregar Pago
							</button>
						</div>

						{/* 2. Tarjeta Resumen e Historial (Blanca) */}
						<div
							style={{
								background: 'white',
								padding: '25px',
								borderRadius: '10px',
								border: '1px solid #dfe6e9',
							}}
						>
							{/* Resumen */}
							<div
								style={{
									borderBottom: '2px solid #eee',
									paddingBottom: '15px',
									marginBottom: '15px',
								}}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: '5px',
									}}
								>
									<span style={{color: '#636e72'}}>
										Total:
									</span>
									<strong>
										$
										{Number(
											product.precio || 0
										).toLocaleString()}
									</strong>
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: '10px',
										color: '#00b894',
									}}
								>
									<span>Pagado:</span>
									<strong>
										${totalPaid.toLocaleString()}
									</strong>
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										fontSize: '1.2rem',
										fontWeight: 'bold',
									}}
								>
									<span style={{color: '#2d3436'}}>
										Restante:
									</span>
									<span
										style={{
											color:
												balance > 0
													? '#d63031'
													: '#00b894',
										}}
									>
										${balance.toLocaleString()}
									</span>
								</div>
							</div>

							{/* Lista */}
							<h4
								style={{marginBottom: '10px', color: '#2d3436'}}
							>
								Historial
							</h4>
							{Array.isArray(payments) && payments.length > 0 ? (
								<ul
									style={{
										listStyle: 'none',
										padding: 0,
										margin: 0,
									}}
								>
									{payments.map((p, i) => (
										<li
											key={i}
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												padding: '10px 0',
												borderBottom:
													'1px solid #f5f5f5',
											}}
										>
											<span
												style={{
													fontSize: '0.9rem',
													color: '#636e72',
												}}
											>
												{p.fecha} <br />
												<b
													style={{
														color: '#2d3436',
														fontSize: '0.8rem',
													}}
												>
													{p.type || p.paymentType}
												</b>
											</span>
											<span
												style={{
													color: '#00b894',
													fontWeight: 'bold',
												}}
											>
												+$
												{Number(
													p.valor || p.amount
												).toLocaleString()}
											</span>
										</li>
									))}
								</ul>
							) : (
								<p
									style={{
										color: '#b2bec3',
										textAlign: 'center',
										fontSize: '0.9rem',
									}}
								>
									No hay pagos registrados.
								</p>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

// Estilos Reutilizables para limpiar el JSX
const inputStyle = {
	width: '100%',
	padding: '10px',
	borderRadius: '5px',
	border: '1px solid #dfe6e9',
	fontSize: '0.95rem',
};

const labelStyle = {
	display: 'block',
	fontSize: '0.85rem',
	fontWeight: '600',
	color: '#636e72',
	marginBottom: '5px',
};

export default ProductDetail;
