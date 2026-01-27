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
	const [payments, setPayments] = useState([]); // Array de pagos

	// Mensajes
	const [successMsg, setSuccessMsg] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	// Formulario Producto
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
		latePickUpDays: 0,
	});

	// Formulario Nuevo Pago
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
				// Usamos /api/pagos si tu backend no ha cambiado a /api/payments globalmente
				const [prodRes, typesRes, statusRes, paymentsRes] =
					await Promise.all([
						axios.get(`${BASE_URL}/api/products/${productId}`),
						axios.get(`${BASE_URL}/api/products/types`),
						axios.get(`${BASE_URL}/api/workorders/statuses`),
						// Intenta cargar pagos, si falla (404) no rompe toda la app
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
				});

				setTypes(typesRes.data);
				setStatuses(statusRes.data);

				// Mapeo seguro de pagos (Array vs Objeto)
				const pagosData = paymentsRes.data;
				if (Array.isArray(pagosData)) {
					setPayments(pagosData);
				} else if (pagosData && typeof pagosData === 'object') {
					// Si el backend devuelve un solo objeto en vez de lista
					setPayments([pagosData]);
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
			setSuccessMsg('✅ Cambios guardados correctamente');
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (err) {
			setErrorMsg('❌ Error al guardar el producto.');
		}
	};

	const handleAddPayment = async () => {
		if (!newPayment.valor) return;
		try {
			const token = localStorage.getItem('token');
			// Asegúrate de usar el endpoint correcto ('payments' o 'pagos')
			const res = await axios.post(
				`${BASE_URL}/api/payments`,
				{
					...newPayment,
					product_id: productId, // El backend espera product_id
					fecha: new Date().toISOString().split('T')[0],
				},
				{
					headers: {Authorization: `Bearer ${token}`},
				}
			);

			// Agregar el nuevo pago a la lista visualmente
			setPayments([...payments, res.data]);
			setNewPayment({...newPayment, valor: ''});
			setSuccessMsg('✅ Pago registrado');
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (err) {
			console.error(err);
			setErrorMsg('Error al registrar el pago.');
		}
	};

	// --- CALCULOS ---
	const totalPaid = Array.isArray(payments)
		? payments.reduce(
				(acc, curr) => acc + Number(curr.valor || curr.amount || 0),
				0
		  )
		: 0;

	const balance = (product.precio || 0) - totalPaid;

	if (loading)
		return (
			<div style={{padding: '40px', textAlign: 'center'}}>
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
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
			}}
		>
			{/* Header */}
			<h1
				style={{
					marginBottom: '20px',
					fontSize: '1.8rem',
					fontWeight: '700',
				}}
			>
				Editar Pedido #{productId}
			</h1>

			{/* Mensajes de Feedback */}
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
						background: '#ff7675',
						color: 'white',
						borderRadius: '5px',
						marginBottom: '20px',
					}}
				>
					{errorMsg}
				</div>
			)}

			{/* --- GRID LAYOUT (1.5fr IZQUIERDA | 1fr DERECHA) --- */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1.5fr 1fr',
					gap: '30px',
					alignItems: 'start',
				}}
			>
				{/* === COLUMNA IZQUIERDA: DATOS DEL MUEBLE === */}
				<div
					style={{
						background: 'white',
						padding: '25px',
						borderRadius: '10px',
						boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Título
								</label>
								<input
									name='titulo'
									value={product.titulo}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								/>
							</div>

							{/* Campos Básicos */}
							<div>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Tipo
								</label>
								<select
									name='productType'
									value={product.productType}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								>
									{types.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Estado
								</label>
								<select
									name='workOrderStatus'
									value={product.workOrderStatus}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								>
									{statuses.map((s) => (
										<option key={s} value={s}>
											{s}
										</option>
									))}
								</select>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Material
								</label>
								<input
									name='material'
									value={product.material}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								/>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Color
								</label>
								<input
									name='color'
									value={product.color}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								/>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Medidas
								</label>
								<input
									name='medidas'
									value={product.medidas}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								/>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Pintura
								</label>
								<input
									name='pintura'
									value={product.pintura}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								/>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Laqueado
								</label>
								<input
									name='laqueado'
									value={product.laqueado}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								/>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Cantidad
								</label>
								<input
									type='number'
									name='cantidad'
									value={product.cantidad}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								/>
							</div>

							{/* Fechas */}
							<div>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Inicio
								</label>
								<input
									type='date'
									name='startDate'
									value={product.startDate}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								/>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Entrega Estimada
								</label>
								<input
									type='date'
									name='fechaEstimada'
									value={product.fechaEstimada}
									onChange={handleChange}
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
									}}
								/>
							</div>

							{/* Precio (Solo Admin/Seller) */}
							{canSeeFinancials && (
								<div style={{gridColumn: '1 / -1'}}>
									<label
										style={{
											display: 'block',
											fontSize: '0.85rem',
											fontWeight: '600',
											color: '#0984e3',
											marginBottom: '5px',
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
											width: '100%',
											padding: '10px',
											borderRadius: '5px',
											border: '1px solid #0984e3',
											fontWeight: 'bold',
											fontSize: '1.1rem',
										}}
									/>
								</div>
							)}

							{/* Notas */}
							<div style={{gridColumn: '1 / -1'}}>
								<label
									style={{
										display: 'block',
										fontSize: '0.85rem',
										fontWeight: '600',
										color: '#636e72',
										marginBottom: '5px',
									}}
								>
									Notas
								</label>
								<textarea
									name='notas'
									value={product.notas}
									onChange={handleChange}
									rows='3'
									style={{
										width: '100%',
										padding: '10px',
										borderRadius: '5px',
										border: '1px solid #dfe6e9',
										fontFamily: 'inherit',
									}}
								/>
							</div>

							{/* Alerta de Demora */}
							{product.latePickUpDays > 0 && (
								<div
									style={{
										gridColumn: '1 / -1',
										padding: '10px',
										background: '#ffeaa7',
										color: '#d35400',
										borderRadius: '5px',
										textAlign: 'center',
										fontWeight: 'bold',
										fontSize: '0.9rem',
									}}
								>
									⚠️{' '}
									{product.workOrderStatus === 'TERMINADO'
										? `Lleva ${product.latePickUpDays} días en depósito sin retirar.`
										: `Tiene ${product.latePickUpDays} días de retraso.`}
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
								cursor: 'pointer',
								fontSize: '1rem',
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
						{/* TARJETA 1: NUEVO PAGO (GRIS) */}
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
								Nuevo Pago
							</h3>

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
								style={{
									width: '100%',
									padding: '10px',
									marginBottom: '10px',
									borderRadius: '5px',
									border: '1px solid #ccc',
								}}
							/>

							<select
								value={newPayment.type}
								onChange={(e) =>
									setNewPayment({
										...newPayment,
										type: e.target.value,
									})
								}
								style={{
									width: '100%',
									padding: '10px',
									marginBottom: '15px',
									borderRadius: '5px',
									border: '1px solid #ccc',
								}}
							>
								<option value='DEPOSIT'>Seña</option>
								<option value='RESTO'>Saldo</option>
								<option value='EXTRA'>Extra</option>
							</select>

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
								Registrar Pago
							</button>
						</div>

						{/* TARJETA 2: HISTORIAL (BLANCO) */}
						<div
							style={{
								background: 'white',
								padding: '25px',
								borderRadius: '10px',
								border: '1px solid #dfe6e9',
							}}
						>
							<h4
								style={{
									marginBottom: '15px',
									borderBottom: '1px solid #eee',
									paddingBottom: '10px',
								}}
							>
								Historial de Pagos
							</h4>

							{Array.isArray(payments) && payments.length > 0 ? (
								<div
									style={{
										maxHeight: '300px',
										overflowY: 'auto',
									}}
								>
									{payments.map((p, i) => (
										<div
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
												{p.fecha || p.date} <br />
												<b style={{color: '#2d3436'}}>
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
										</div>
									))}
								</div>
							) : (
								<p
									style={{
										color: '#b2bec3',
										textAlign: 'center',
										padding: '10px',
									}}
								>
									No hay pagos registrados.
								</p>
							)}

							{/* Resumen Financiero */}
							<div
								style={{
									marginTop: '20px',
									paddingTop: '15px',
									borderTop: '2px solid #eee',
								}}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: '5px',
									}}
								>
									<span>Total Pedido:</span>
									<strong>
										$
										{Number(
											product.precio
										).toLocaleString()}
									</strong>
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: '5px',
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
										marginTop: '10px',
										fontSize: '1.2rem',
										fontWeight: 'bold',
										color:
											balance > 0 ? '#d63031' : '#2d3436',
									}}
								>
									<span>Restante:</span>
									<span>${balance.toLocaleString()}</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductDetail;
