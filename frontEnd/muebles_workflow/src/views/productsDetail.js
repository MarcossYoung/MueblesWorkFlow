import React, {useState, useEffect, useContext} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {BASE_URL} from '../api/config';
import {UserContext} from '../UserProvider';

const ProductDetail = () => {
	const {productId} = useParams();
	const {user} = useContext(UserContext);

	// State
	const [loading, setLoading] = useState(true);
	const [types, setTypes] = useState([]);
	const [statuses, setStatuses] = useState([]);
	const [payments, setPayments] = useState([]);

	// Feedback State
	const [successMsg, setSuccessMsg] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	// Form State
	const [product, setProduct] = useState({
		titulo: '',
		productType: '', // Changed from 'type' to match your DTO usually
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
		workOrderStatus: '', // Changed from 'status'
		totalPaid: 0, // From your DTO logic
		depositPaid: 0, // From your DTO logic
		daysLate: 0, // From your DTO logic
	});

	const [newPayment, setNewPayment] = useState({
		valor: '',
		type: 'DEPOSIT',
		pagostatus: 'SEÑA',
	});

	// Permission Check
	const canSeeFinancials = user?.role === 'ADMIN' || user?.role === 'SELLER';

	// --- LOAD DATA ---
	useEffect(() => {
		const loadData = async () => {
			try {
				// Fetch everything in parallel
				const [prodRes, typesRes, statusRes, paymentsRes] =
					await Promise.all([
						axios.get(`${BASE_URL}/api/products/${productId}`),
						axios.get(`${BASE_URL}/api/products/types`),
						axios.get(`${BASE_URL}/api/workorders/statuses`), // Or wherever you keep statuses
						axios.get(`${BASE_URL}/api/payments/${productId}`),
					]);

				// Map response to state
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
				setPayments(paymentsRes.data);
			} catch (err) {
				console.error('Error loading data', err);
				setErrorMsg('Error al cargar los datos.');
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
				`${BASE_URL}/api/pagos`,
				{
					...newPayment,
					product_id: productId,
					fecha: new Date().toISOString().split('T')[0],
				},
				{
					headers: {Authorization: `Bearer ${token}`},
				}
			);

			setPayments([...payments, res.data]);
			setNewPayment({...newPayment, valor: ''}); // Reset amount
			setSuccessMsg('✅ Pago registrado');
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (err) {
			setErrorMsg('Error al registrar pago');
		}
	};

	// --- RENDER HELPERS ---

	if (loading) return <div className='admin-dashboard'>Cargando...</div>;

	// Calculate Financial Totals
	const totalPaid = payments.reduce(
		(acc, curr) => acc + Number(curr.valor),
		0
	);
	const balance = product.precio - totalPaid;

	return (
		<section className='admin-dashboard'>
			<h1 className='main-title'>Detalle del Pedido #{productId}</h1>

			{/* FEEDBACK MESSAGES */}
			{successMsg && (
				<div className='success-message' style={{marginBottom: '1rem'}}>
					{successMsg}
				</div>
			)}
			{errorMsg && (
				<div className='error-message' style={{marginBottom: '1rem'}}>
					{errorMsg}
				</div>
			)}

			{/* --- MAIN GRID LAYOUT --- */}
			<div className='finance-grid' style={{alignItems: 'start'}}>
				{/* --- LEFT COLUMN: PRODUCT EDIT FORM --- */}
				<div
					className='product-wrapper'
					style={{background: 'white', padding: '2rem'}}
				>
					<h2 style={{marginBottom: '1.5rem', color: '#2d3436'}}>
						Datos del Mueble
					</h2>

					<form
						onSubmit={handleSaveProduct}
						className='costs-form'
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '1rem',
						}}
					>
						{/* Title (Full Width) */}
						<div
							className='form-input'
							style={{gridColumn: '1 / -1'}}
						>
							<label className='main-label'>Título</label>
							<input
								name='titulo'
								value={product.titulo}
								onChange={handleChange}
							/>
						</div>

						{/* Basic Info */}
						<div className='form-input'>
							<label className='main-label'>Tipo</label>
							<select
								name='productType'
								value={product.productType}
								onChange={handleChange}
							>
								{types.map((t) => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
						</div>

						<div className='form-input'>
							<label className='main-label'>Estado</label>
							<select
								name='workOrderStatus'
								value={product.workOrderStatus}
								onChange={handleChange}
							>
								{statuses.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</select>
						</div>

						<div className='form-input'>
							<label className='main-label'>Material</label>
							<input
								name='material'
								value={product.material}
								onChange={handleChange}
							/>
						</div>

						<div className='form-input'>
							<label className='main-label'>Color</label>
							<input
								name='color'
								value={product.color}
								onChange={handleChange}
							/>
						</div>

						<div className='form-input'>
							<label className='main-label'>Medidas</label>
							<input
								name='medidas'
								value={product.medidas}
								onChange={handleChange}
							/>
						</div>

						<div className='form-input'>
							<label className='main-label'>Pintura</label>
							<input
								name='pintura'
								value={product.pintura}
								onChange={handleChange}
							/>
						</div>

						<div className='form-input'>
							<label className='main-label'>Laqueado</label>
							<input
								name='laqueado'
								value={product.laqueado}
								onChange={handleChange}
							/>
						</div>

						<div className='form-input'>
							<label className='main-label'>Cantidad</label>
							<input
								type='number'
								name='cantidad'
								value={product.cantidad}
								onChange={handleChange}
							/>
						</div>

						{/* Dates */}
						<div className='form-input'>
							<label className='main-label'>Inicio</label>
							<input
								type='date'
								name='startDate'
								value={product.startDate}
								onChange={handleChange}
							/>
						</div>

						<div className='form-input'>
							<label className='main-label'>
								Entrega Estimada
							</label>
							<input
								type='date'
								name='fechaEstimada'
								value={product.fechaEstimada}
								onChange={handleChange}
							/>
						</div>
						<div className='form-input'>
							<label className='main-label'>Fecha Entrega</label>
							<input
								type='date'
								name='fechaEntrega'
								value={product.fechaEntrega}
								onChange={handleChange}
							/>
						</div>

						{/* Price (Protected) */}
						{canSeeFinancials && (
							<div
								className='form-input'
								style={{gridColumn: '1 / -1'}}
							>
								<label
									className='main-label'
									style={{color: '#00b894'}}
								>
									Precio Total ($)
								</label>
								<input
									type='number'
									name='precio'
									value={product.precio}
									onChange={handleChange}
									style={{
										fontWeight: 'bold',
										fontSize: '1.1rem',
									}}
								/>
								<label
									className='main-label'
									style={{color: '#00b894'}}
								>
									Depósito ($)
								</label>
								<input
									type='number'
									name='depositPaid'
									value={product.depositPaid}
									onChange={handleChange}
									style={{
										fontWeight: 'bold',
										fontSize: '1.1rem',
									}}
								/>
								<label
									className='main-label'
									style={{color: '#00b894'}}
								>
									Total Pagado ($)
								</label>
								<input
									type='number'
									name='totalPaid'
									value={product.totalPaid}
									onChange={handleChange}
									style={{
										fontWeight: 'bold',
										fontSize: '1.1rem',
									}}
								/>
							</div>
						)}

						{/* Notes (Full Width) */}
						<div
							className='form-input'
							style={{gridColumn: '1 / -1'}}
						>
							<label className='main-label'>Notas</label>
							<textarea
								name='notas'
								value={product.notas}
								onChange={handleChange}
								rows='3'
								style={{
									width: '100%',
									padding: '0.7rem',
									borderRadius: '8px',
									border: '1px solid #333',
									background: '#222',
									color: 'white',
								}}
							/>
						</div>

						{/* Day Counter Display */}
						{product.daysLate > 0 && (
							<div
								style={{
									gridColumn: '1 / -1',
									padding: '10px',
									background: '#ffeaa7',
									color: '#d35400',
									borderRadius: '8px',
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

						<div style={{gridColumn: '1 / -1', marginTop: '1rem'}}>
							<button
								type='submit'
								className='button-green'
								style={{
									width: '100%',
									justifyContent: 'center',
								}}
							>
								Guardar Cambios
							</button>
						</div>
					</form>
				</div>

				{/* --- RIGHT COLUMN: FINANCIALS (Protected) --- */}
				{canSeeFinancials && (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '1.5rem',
						}}
					>
						{/* 1. Add Payment Card */}
						<div
							className='product-wrapper'
							style={{
								background: '#f7f9fc',
								padding: '1.5rem',
								border: '1px solid #dfe6e9',
							}}
						>
							<h3 style={{marginBottom: '1rem'}}>
								Registrar Pago
							</h3>

							<div className='form-input'>
								<label className='main-label'>Monto ($)</label>
								<input
									type='number'
									value={newPayment.valor}
									onChange={(e) =>
										setNewPayment({
											...newPayment,
											valor: e.target.value,
										})
									}
									style={{
										background: 'white',
										color: '#2d3436',
										borderColor: '#ddd',
									}}
								/>
							</div>

							<div className='form-input'>
								<label className='main-label'>Concepto</label>
								<select
									value={newPayment.type}
									onChange={(e) =>
										setNewPayment({
											...newPayment,
											type: e.target.value,
										})
									}
									style={{
										background: 'white',
										color: '#2d3436',
										borderColor: '#ddd',
									}}
								>
									<option value='DEPOSIT'>Seña</option>
									<option value='RESTO'>Saldo</option>
									<option value='EXTRA'>Extra</option>
								</select>
							</div>

							<button
								onClick={handleAddPayment}
								className='button-green'
								style={{
									width: '100%',
									justifyContent: 'center',
								}}
							>
								+ Agregar Pago
							</button>
						</div>

						{/* 2. Balance Summary */}
						<div
							className='card'
							style={{justifyContent: 'space-between'}}
						>
							<div>
								<h3 style={{margin: 0, color: '#636e72'}}>
									Restante
								</h3>
								<p
									style={{
										fontSize: '1.8rem',
										color:
											balance > 0 ? '#d63031' : '#00b894',
										margin: 0,
										fontWeight: '800',
									}}
								>
									${balance.toLocaleString()}
								</p>
							</div>
							<div style={{textAlign: 'right'}}>
								<small>
									Total: $
									{Number(product.precio).toLocaleString()}
								</small>
								<br />
								<small>
									Pagado: ${totalPaid.toLocaleString()}
								</small>
							</div>
						</div>

						{/* 3. History List */}
						<div
							className='product-wrapper'
							style={{background: 'white', padding: '1.5rem'}}
						>
							<h3 style={{marginBottom: '1rem'}}>Historial</h3>
							{payments.length === 0 ? (
								<p style={{color: '#aaa', textAlign: 'center'}}>
									No hay pagos registrados.
								</p>
							) : (
								<ul style={{listStyle: 'none', padding: 0}}>
									{payments.map((p, i) => (
										<li
											key={i}
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												padding: '10px 0',
												borderBottom: '1px solid #eee',
											}}
										>
											<span style={{fontSize: '0.9rem'}}>
												{p.fecha} <br />
												<span
													className='badge OTRO'
													style={{fontSize: '0.7rem'}}
												>
													{p.type}
												</span>
											</span>
											<span
												style={{
													color: '#00b894',
													fontWeight: 'bold',
												}}
											>
												+$
												{Number(
													p.valor
												).toLocaleString()}
											</span>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default ProductDetail;
