import React, {useState, useEffect, useContext, useCallback} from 'react';
import axios from 'axios';
import {UserContext} from '../UserProvider';
import {BASE_URL} from '../api/config';

export default function CostsManager() {
	const {user} = useContext(UserContext);
	const [costs, setCosts] = useState([]);
	const [loading, setLoading] = useState(true);

	// Form State
	const [formData, setFormData] = useState({
		date: new Date().toISOString().split('T')[0],
		amount: '',
		costType: 'OTHERS',
		frequency: 'ONE_TIME',
	});

	const fetchCosts = useCallback(async () => {
		try {
			setLoading(true);
			const res = await axios.get(`${BASE_URL}/api/costs`, {
				headers: {Authorization: `Bearer ${user.token}`},
			});
			setCosts(res.data);
		} catch (err) {
			console.error('Error fetching costs', err);
		} finally {
			setLoading(false);
		}
	}, [user.token]);

	useEffect(() => {
		fetchCosts();
	}, [fetchCosts]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axios.post(`${BASE_URL}/api/costs`, formData, {
				headers: {Authorization: `Bearer ${user.token}`},
			});
			setFormData({...formData, amount: ''}); // Reset amount
			fetchCosts(); // Refresh list
		} catch (err) {
			alert('Error saving cost');
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('¿Eliminar este gasto?')) return;
		await axios.delete(`${BASE_URL}/api/costs/${id}`, {
			headers: {Authorization: `Bearer ${user.token}`},
		});
		fetchCosts();
	};

	if (loading && costs.length === 0) {
		return <div className='admin-dashboard'>Cargando costos...</div>;
	}

	return (
		<div className='admin-dashboard'>
			<h1 className='main-title'>Gestión de Costos</h1>

			{/* ADD COST FORM */}
			<div className='chart-container' style={{marginBottom: '2rem'}}>
				<h3>Registrar Nuevo Gasto</h3>
				<form
					onSubmit={handleSubmit}
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
						gap: '10px',
						alignItems: 'end',
					}}
				>
					<div>
						<label>Fecha</label>
						<input
							type='date'
							value={formData.date}
							onChange={(e) =>
								setFormData({...formData, date: e.target.value})
							}
							required
						/>
					</div>
					<div>
						<label>Monto ($)</label>
						<input
							type='number'
							value={formData.amount}
							onChange={(e) =>
								setFormData({
									...formData,
									amount: e.target.value,
								})
							}
							required
						/>
					</div>
					<div>
						<label>Tipo</label>
						<select
							value={formData.costType}
							onChange={(e) =>
								setFormData({
									...formData,
									costType: e.target.value,
								})
							}
						>
							<option value='RENT'>Alquiler</option>
							<option value='MATERIAL'>Materiales</option>
							<option value='SALARY'>Salarios</option>
							<option value='TAX'>Impuestos</option>
							<option value='ADS'>Anuncios</option>
							<option value='SERVICES'>Servicios</option>
							<option value='OTHERS'>Otros</option>
						</select>
					</div>
					<div>
						<label>Frecuencia</label>
						<select
							value={formData.frequency}
							onChange={(e) =>
								setFormData({
									...formData,
									frequency: e.target.value,
								})
							}
						>
							<option value='ONE_TIME'>Única vez</option>
							<option value='WEEKLY'>Semanal</option>
							<option value='MONTHLY'>Mensual</option>
							<option value='YEARLY'>Anual</option>
						</select>
					</div>
					<button
						type='submit'
						className='btn-primary'
						style={{padding: '10px 20px'}}
					>
						Agregar
					</button>
				</form>
			</div>

			{/* COSTS TABLE */}
			<div className='chart-container'>
				<h3>Gastos Recientes</h3>
				<table style={{width: '100%', borderCollapse: 'collapse'}}>
					<thead>
						<tr
							style={{
								borderBottom: '2px solid #eee',
								textAlign: 'left',
							}}
						>
							<th style={{padding: '10px'}}>Fecha</th>
							<th>Tipo</th>
							<th>Monto</th>
							<th>Frecuencia</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{costs.map((c) => (
							<tr
								key={c.id}
								style={{borderBottom: '1px solid #f9f9f9'}}
							>
								<td style={{padding: '10px'}}>{c.date}</td>
								<td>
									<span className={`badge ${c.costType}`}>
										{c.costType}
									</span>
								</td>
								<td>${c.amount.toLocaleString()}</td>
								<td>{c.frequency}</td>
								<td>
									<button
										onClick={() => handleDelete(c.id)}
										style={{
											color: 'red',
											background: 'none',
											border: 'none',
											cursor: 'pointer',
										}}
									>
										Eliminar
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
