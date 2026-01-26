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
		reason: '',
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
			setFormData({...formData, amount: '', reason: ''}); // Reset amount and reason
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
		<section className='admin-dashboard'>
			<h1 className='main-title'>Gestión de Costos</h1>

			{/* MAIN WHITE CARD WRAPPER */}
			<div className='costs-wrapper'>
				{/* --- 1. FORM SECTION --- */}
				<div className='costs-header'>
					<h2>Registrar Nuevo Gasto</h2>
				</div>

				<form onSubmit={handleSubmit} className='costs-form'>
					<div className='form-group'>
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

					<div className='form-group'>
						<label>Asunto</label>
						<input
							type='text'
							placeholder='Ej: Compra de insumos'
							value={formData.reason}
							onChange={(e) =>
								setFormData({
									...formData,
									reason: e.target.value,
								})
							}
							required
						/>
					</div>

					<div className='form-group'>
						<label>Monto ($)</label>
						<input
							type='number'
							placeholder='0.00'
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

					<div className='form-group'>
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

					<div className='form-group'>
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

					<button type='submit' className='button-green'>
						Agregar
					</button>
				</form>

				{/* --- 2. TABLE SECTION --- */}
				<div className='costs-header' style={{marginTop: '2rem'}}>
					<h2>Gastos Recientes</h2>
				</div>

				<div className='table-wrapper'>
					<table className='orders-table'>
						<thead>
							<tr>
								<th>Fecha</th>
								<th>Asunto</th>
								<th>Tipo</th>
								<th>Monto</th>
								<th>Frecuencia</th>
								<th className='text-center'>Acciones</th>
							</tr>
						</thead>
						<tbody>
							{costs.map((c) => (
								<tr key={c.id}>
									<td>{c.date}</td>
									<td>{c.reason || '-'}</td>
									<td>
										<span className='badge OTRO'>
											{c.costType}
										</span>
									</td>
									<td style={{fontWeight: 'bold'}}>
										${Number(c.amount).toLocaleString()}
									</td>
									<td>{c.frequency}</td>
									<td className='text-center'>
										<button
											className='btn-delete'
											onClick={() => handleDelete(c.id)}
										>
											Eliminar
										</button>
									</td>
								</tr>
							))}
							{costs.length === 0 && (
								<tr>
									<td
										colSpan='6'
										className='text-center'
										style={{padding: '2rem'}}
									>
										No hay gastos registrados.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}
