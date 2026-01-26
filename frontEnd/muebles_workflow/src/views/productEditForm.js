import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';
import {BASE_URL} from '../api/config';
import {UserContext} from '../UserProvider';

const EditProduct = () => {
	const {productId} = useParams();
	const {user} = useContext(UserContext);

	const [types, setTypes] = useState([]);
	const [payments, setPayments] = useState([]);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(null);

	const [product, setProduct] = useState({
		titulo: '',
		type: '',
		medidas: '',
		material: '',
		pintura: '',
		laqueado: '',
		color: '',
		precio: 0,
		cantidad: 1,
		startDate: '',
		fechaEstimada: '',
		notas: '',
	});

	const [newPayment, setNewPayment] = useState({
		valor: '',
		type: 'DEPOSIT',
		pagostatus: 'SEÑA',
	});

	useEffect(() => {
		const loadData = async () => {
			try {
				const [prodRes, typesRes, paymentsRes] = await Promise.all([
					axios.get(`${BASE_URL}/api/products/${productId}`),
					axios.get(`${BASE_URL}/api/products/types`),
					axios.get(`${BASE_URL}/api/pagos/${productId}`),
				]);
				setProduct(prodRes.data);
				setTypes(typesRes.data);
				setPayments(paymentsRes.data);
			} catch (err) {
				setError('No se pudieron cargar los datos del producto.');
			}
		};
		loadData();
	}, [productId]);

	const handleProductSubmit = async (e) => {
		e.preventDefault();
		setSuccess(false);
		setError(null);
		try {
			await axios.put(`${BASE_URL}/api/products/${productId}`, product, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
					'Content-Type': 'application/json',
				},
			});
			setSuccess(true);
		} catch (err) {
			setError('Error al actualizar los datos del producto.');
		}
	};

	const handleAddPayment = async () => {
		if (!newPayment.valor) return;
		setSuccess(false);
		setError(null);
		try {
			const res = await axios.post(
				`${BASE_URL}/api/pagos`,
				{
					...newPayment,
					product_id: productId,
					fecha: new Date().toISOString().split('T')[0],
				},
				{
					headers: {Authorization: `Bearer ${user?.token}`},
				}
			);
			setPayments([...payments, res.data]);
			setSuccess(true);
			setNewPayment({
				valor: '',
				type: 'DEPOSIT',
				pagostatus: 'PAGO_SEÑA',
			});
		} catch (err) {
			setError('Error al registrar el pago.');
		}
	};

	return (
		<div
			style={{
				padding: '30px',
				maxWidth: '1100px',
				margin: '0 auto',
				color: '#2d3436',
			}}
		>
			<h1>Editar Pedido</h1>

			{/* Mensajes de Feedback */}
			{success && (
				<div
					style={{
						padding: '15px',
						background: '#00b894',
						color: 'white',
						borderRadius: '5px',
						marginBottom: '20px',
					}}
				>
					¡Acción realizada con éxito!
				</div>
			)}
			{error && (
				<div
					style={{
						padding: '15px',
						background: '#ff7675',
						color: 'white',
						borderRadius: '5px',
						marginBottom: '20px',
					}}
				>
					{error}
				</div>
			)}

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1.5fr 1fr',
					gap: '25px',
				}}
			>
				{/* FORMULARIO PRODUCTO */}
				<div
					style={{
						background: 'white',
						padding: '20px',
						borderRadius: '10px',
						boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
					}}
				>
					<h3>Datos del Mueble</h3>
					<form onSubmit={handleProductSubmit}>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '15px',
							}}
						>
							<input
								name='titulo'
								value={product.titulo}
								onChange={(e) =>
									setProduct({
										...product,
										titulo: e.target.value,
									})
								}
								placeholder='Título'
							/>
							<select
								name='type'
								value={product.type}
								onChange={(e) =>
									setProduct({
										...product,
										type: e.target.value,
									})
								}
							>
								{types.map((t) => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
							{/* ... Resto de los inputs similares ... */}
						</div>
						<button
							type='submit'
							style={{
								marginTop: '20px',
								width: '100%',
								background: '#0984e3',
								color: 'white',
								border: 'none',
								padding: '10px',
								borderRadius: '5px',
							}}
						>
							Guardar Cambios
						</button>
					</form>
				</div>

				{/* SECCIÓN PAGOS */}
				<div>
					<div
						style={{
							background: '#f1f2f6',
							padding: '20px',
							borderRadius: '10px',
							marginBottom: '20px',
						}}
					>
						<h3>Nuevo Pago</h3>
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
							style={{width: '100%', marginBottom: '10px'}}
						/>
						<select
							value={newPayment.type}
							onChange={(e) =>
								setNewPayment({
									...newPayment,
									type: e.target.value,
								})
							}
							style={{width: '100%', marginBottom: '10px'}}
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
							}}
						>
							Registrar Pago
						</button>
					</div>

					<div
						style={{
							background: 'white',
							padding: '20px',
							borderRadius: '10px',
							border: '1px solid #dfe6e9',
						}}
					>
						<h4>Historial de Pagos</h4>
						{payments.map((p, i) => (
							<div
								key={i}
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									padding: '10px 0',
									borderBottom: '1px solid #eee',
								}}
							>
								<span>
									{p.fecha} - <b>{p.type}</b>
								</span>
								<span style={{color: '#00b894'}}>
									+${p.valor}
								</span>
							</div>
						))}
						<div
							style={{
								marginTop: '15px',
								fontWeight: 'bold',
								textAlign: 'right',
							}}
						>
							Total: $
							{payments.reduce(
								(acc, curr) => acc + Number(curr.valor),
								0
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditProduct;
