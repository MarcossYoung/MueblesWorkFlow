import React, {useState, useEffect, useContext} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {BASE_URL} from '../api/config';
import {UserContext} from '../UserProvider';

const ProductDetail = () => {
	const {productId} = useParams();
	const {user} = useContext(UserContext);

	// --- STATES ---
	const [loading, setLoading] = useState(true);
	const [types, setTypes] = useState([]);
	const [statuses, setStatuses] = useState([]);
	const [payments, setPayments] = useState([]);

	// Feedback
	const [successMsg, setSuccessMsg] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	// Product State (Matches ProductResponse.java)
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

	// New Payment State
	const [newPayment, setNewPayment] = useState({
		valor: '',
		type: 'DEPOSIT',
		paymentMethod: 'BANK_TRANSFER',
	});
	const [receiptFile, setReceiptFile] = useState(null);
	const [uploadingReceipt, setUploadingReceipt] = useState(null); // paymentId being uploaded inline

	// Permissions
	const canSeeFinancials = user?.role === 'ADMIN' || user?.role === 'SELLER';

	// --- LOAD DATA ---
	useEffect(() => {
		const loadData = async () => {
			try {
				// Load everything in parallel
				const [prodRes, typesRes, statusRes, paymentsRes] =
					await Promise.all([
						axios.get(`${BASE_URL}/api/products/${productId}`),
						axios.get(`${BASE_URL}/api/products/types`),
						axios.get(`${BASE_URL}/api/workorders/statuses`),
						// Catch 404 on payments gracefully
						axios
							.get(`${BASE_URL}/api/payments/${productId}`)
							.catch(() => ({data: []})),
					]);

				// Safe Mapping
				setProduct({
					...prodRes.data,
					productType:
						prodRes.data.productType || prodRes.data.type || '',
					workOrderStatus:
						prodRes.data.workOrderStatus ||
						prodRes.data.status ||
						'',
					daysLate: prodRes.data.daysLate || 0,
					precio: prodRes.data.precio || 0, // Ensure price isn't null
				});

				setTypes(typesRes.data);
				setStatuses(statusRes.data);

				// Handle Payments (Array vs Object check)
				const dataPagos = paymentsRes.data;
				if (Array.isArray(dataPagos)) {
					setPayments(dataPagos);
				} else if (dataPagos && typeof dataPagos === 'object') {
					setPayments([dataPagos]);
				} else {
					setPayments([]);
				}
			} catch (err) {
				console.error('Error loading data', err);
				setErrorMsg('No se pudieron cargar los datos del producto.');
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
				},
			);

			// If a file was selected, upload the receipt now
			if (receiptFile) {
				const newPaymentId = res.data.id;
				const formData = new FormData();
				formData.append('file', receiptFile);
				await axios.post(
					`${BASE_URL}/api/payments/${newPaymentId}/receipt`,
					formData,
					{headers: {Authorization: `Bearer ${token}`}},
				);
			}

			// Refresh payments list to get updated hasReceipt flags
			const paymentsRes = await axios.get(`${BASE_URL}/api/payments/${productId}`);
			setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);

			setNewPayment({...newPayment, valor: '', paymentMethod: 'BANK_TRANSFER'});
			setReceiptFile(null);
			setSuccessMsg('✅ Pago registrado');
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (err) {
			setErrorMsg('Error al registrar pago');
		}
	};

	const handleInlineReceiptUpload = async (paymentId, file) => {
		if (!file) return;
		try {
			const token = localStorage.getItem('token');
			const formData = new FormData();
			formData.append('file', file);
			await axios.post(
				`${BASE_URL}/api/payments/${paymentId}/receipt`,
				formData,
				{headers: {Authorization: `Bearer ${token}`}},
			);
			// Refresh payments to update hasReceipt
			const paymentsRes = await axios.get(`${BASE_URL}/api/payments/${productId}`);
			setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
			setUploadingReceipt(null);
			setSuccessMsg('✅ Comprobante subido');
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (err) {
			setErrorMsg('Error al subir comprobante');
		}
	};

	// --- CALCULATIONS ---
	const totalPaid = Array.isArray(payments)
		? payments.reduce(
				(acc, curr) => acc + Number(curr.valor || curr.amount || 0),
				0,
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

			{/* FEEDBACK MESSAGES */}
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

			{/* --- MAIN GRID LAYOUT --- */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1.5fr 1fr',
					gap: '30px',
					alignItems: 'start',
				}}
			>
				{/* === LEFT COLUMN: FORM === */}
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
							{/* Title (Full Width) */}
							<div style={{gridColumn: '1 / -1'}}>
								<label style={labelStyle}>Título</label>
								<input
									name='titulo'
									value={product.titulo}
									onChange={handleChange}
									style={inputStyle}
								/>
							</div>

							{/* Dropdowns */}
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

							{/* Details */}
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

							{/* Dates */}
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

							{/* Delivery Date */}
							<div style={{gridColumn: '1 / -1'}}>
								<label style={labelStyle}>
									Fecha de Entrega Real
								</label>
								<input
									type='date'
									name='fechaEntrega'
									value={product.fechaEntrega}
									onChange={handleChange}
									style={{...inputStyle, width: '50%'}}
								/>
							</div>

							{/* PRICE FIELD (Only for Admin/Seller) - RESTORED */}
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

							{/* Notes */}
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

							{/* Late Warning */}
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

				{/* === RIGHT COLUMN: FINANCIALS === */}
				{canSeeFinancials && (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '20px',
						}}
					>
						{/* 1. New Payment Card */}
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

							<div style={{marginBottom: '10px'}}>
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

							<div style={{marginBottom: '10px'}}>
								<select
									value={newPayment.paymentMethod}
									onChange={(e) =>
										setNewPayment({
											...newPayment,
											paymentMethod: e.target.value,
										})
									}
									style={inputStyle}
								>
									<option value='CASH'>Efectivo</option>
									<option value='BANK_TRANSFER'>Transferencia</option>
									<option value='CREDIT_DEBIT_CARD'>Tarjeta</option>
									<option value='OTHER'>Otro</option>
								</select>
							</div>

							<div style={{marginBottom: '15px'}}>
								<label style={{...labelStyle, marginBottom: '4px'}}>
									Comprobante (opcional)
								</label>
								<input
									type='file'
									accept='.jpg,.jpeg,.png,.pdf'
									onChange={(e) => setReceiptFile(e.target.files[0] || null)}
									style={{...inputStyle, padding: '6px'}}
								/>
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

						{/* 2. Summary & History Card */}
						<div
							style={{
								background: 'white',
								padding: '25px',
								borderRadius: '10px',
								border: '1px solid #dfe6e9',
							}}
						>
							{/* Summary */}
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
											product.precio || 0,
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

							{/* History List */}
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
												padding: '10px 0',
												borderBottom: '1px solid #f5f5f5',
											}}
										>
											<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
												<span style={{fontSize: '0.9rem', color: '#636e72'}}>
													{p.paymentDate || p.fecha} <br />
													<b style={{color: '#2d3436', fontSize: '0.8rem'}}>
														{p.paymentType || p.type}
													</b>
												</span>
												<span style={{color: '#00b894', fontWeight: 'bold'}}>
													+${Number(p.amount || p.valor).toLocaleString()}
												</span>
											</div>
											<div style={{marginTop: '5px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
												{p.paymentMethod && (
													<span style={{
														fontSize: '0.75rem',
														padding: '2px 8px',
														borderRadius: '12px',
														background: '#dfe6e9',
														color: '#2d3436',
													}}>
														{methodLabel(p.paymentMethod)}
													</span>
												)}
												{p.hasReceipt ? (
													<a
														href={`${BASE_URL}/api/payments/${p.id}/receipt`}
														target='_blank'
														rel='noreferrer'
														style={{fontSize: '0.8rem', color: '#0984e3', textDecoration: 'none'}}
													>
														Ver comprobante
													</a>
												) : p.paymentMethod !== 'CASH' && (
													uploadingReceipt === p.id ? (
														<input
															type='file'
															accept='.jpg,.jpeg,.png,.pdf'
															autoFocus
															style={{fontSize: '0.75rem'}}
															onChange={(e) => handleInlineReceiptUpload(p.id, e.target.files[0])}
														/>
													) : (
														<button
															onClick={() => setUploadingReceipt(p.id)}
															style={{
																fontSize: '0.75rem',
																padding: '2px 8px',
																border: '1px solid #b2bec3',
																borderRadius: '4px',
																background: 'transparent',
																cursor: 'pointer',
																color: '#636e72',
															}}
														>
															Subir comprobante
														</button>
													)
												)}
											</div>
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

// Payment method display labels
const methodLabel = (method) => {
	const labels = {
		CASH: 'Efectivo',
		BANK_TRANSFER: 'Transferencia',
		CREDIT_DEBIT_CARD: 'Tarjeta',
		OTHER: 'Otro',
	};
	return labels[method] || method;
};

// Reusable Styles
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
