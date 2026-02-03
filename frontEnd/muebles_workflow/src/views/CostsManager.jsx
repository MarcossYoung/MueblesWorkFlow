import React, {useState, useEffect, useContext, useCallback} from 'react';
import axios from 'axios';
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa'; // Iconos para paginación
import {UserContext} from '../UserProvider';
import {BASE_URL} from '../api/config';

export default function CostsManager() {
	const {user} = useContext(UserContext);

	// Data State
	const [costs, setCosts] = useState([]);
	const [loading, setLoading] = useState(true);

	// Pagination & Search State
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');

	// Form State
	const [formData, setFormData] = useState({
		date: new Date().toISOString().split('T')[0],
		amount: '',
		costType: 'OTHERS',
		frequency: 'ONE_TIME',
		reason: '',
	});

	// --- FETCH CON PAGINACIÓN ---
	const fetchCosts = useCallback(async () => {
		try {
			setLoading(true);
			const res = await axios.get(`${BASE_URL}/api/costs`, {
				headers: {Authorization: `Bearer ${user.token}`},
				params: {page: currentPage, size: 10},
				// Items por página
			});

			// Soporte dual: Si el backend pagina devuelve "content", sino devuelve array directo
			if (res.data.content) {
				setCosts(res.data.content);
				setTotalPages(res.data.totalPages);
			} else {
				setCosts(res.data);
				setTotalPages(1);
			}
		} catch (err) {
			console.error('Error fetching costs', err);
		} finally {
			setLoading(false);
		}
	}, [user.token, currentPage]);

	useEffect(() => {
		fetchCosts();
	}, [fetchCosts]);

	// --- FILTRO SEGURO (Mantenemos la lógica arreglada) ---
	let filtered = costs.filter((c) => {
		const search = searchTerm.toLowerCase();
		// Usamos (valor || '') para evitar crash con nulls
		return (
			(c.reason || '').toLowerCase().includes(search) ||
			(c.costType || '').toLowerCase().includes(search)
		);
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axios.post(`${BASE_URL}/api/costs`, formData, {
				headers: {Authorization: `Bearer ${user.token}`},
			});
			setFormData({...formData, amount: '', reason: ''});
			fetchCosts();
		} catch (err) {
			alert('Error saving cost');
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('¿Eliminar este gasto?')) return;
		try {
			await axios.delete(`${BASE_URL}/api/costs/${id}`, {
				headers: {Authorization: `Bearer ${user.token}`},
			});
			fetchCosts();
		} catch (err) {
			console.error(err);
		}
	};

	if (loading && costs.length === 0) {
		return (
			<div className='admin-dashboard' style={{padding: '2rem'}}>
				Cargando costos...
			</div>
		);
	}

	return (
		<section className='admin-dashboard'>
			<h1 className='main-title'>Gestión de Costos</h1>

			{/* --- CONTENEDOR PRINCIPAL (Estilo original del CSS) --- */}
			<div className='costs-wrapper'>
				{/* 1. SECCIÓN DE FORMULARIO (Mantiene tu CSS Grid) */}
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

					{/* El botón se alineará correctamente gracias al grid del CSS original */}
					<button type='submit' className='button-green'>
						Agregar
					</button>
				</form>

				{/* Buscador */}
				<div
					className='search-container'
					style={{marginTop: '2rem', marginBottom: '1rem'}}
				>
					<input
						type='text'
						placeholder='Buscar por asunto o tipo...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						style={{
							width: '100%',
							padding: '10px',
							borderRadius: '8px',
							border: '1px solid #ccc',
						}}
					/>
				</div>

				{/* 2. SECCIÓN DE TABLA */}
				<div className='costs-header'>
					<h2>Gastos Recientes</h2>
				</div>

				<div
					className='table-wrapper'
					style={{boxShadow: 'none', padding: 0}}
				>
					<table className='orders-table' style={{width: '100%'}}>
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
							{filtered.length > 0 ? (
								filtered.map((c) => (
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
												onClick={() =>
													handleDelete(c.id)
												}
											>
												Eliminar
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan='6'
										className='text-center'
										style={{padding: '2rem', color: '#888'}}
									>
										{searchTerm
											? 'No se encontraron gastos con esa búsqueda.'
											: 'No hay gastos registrados.'}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* 3. PAGINACIÓN (Estilo idéntico a OrdersTable) */}
				<div
					className='pagination-container'
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						gap: '20px',
						marginTop: '30px',
						marginBottom: '10px',
					}}
				>
					<button
						disabled={currentPage === 0}
						onClick={() => setCurrentPage((prev) => prev - 1)}
						className='btn-pagination'
						style={{
							// Estilos inline para asegurar match visual si no están en CSS global
							background: 'white',
							border: '1px solid #ddd',
							padding: '0.5rem 1rem',
							borderRadius: '8px',
							cursor:
								currentPage === 0 ? 'not-allowed' : 'pointer',
							opacity: currentPage === 0 ? 0.5 : 1,
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							fontWeight: '600',
						}}
					>
						<FaChevronLeft /> Anterior
					</button>

					<span style={{fontWeight: 'bold', color: '#555'}}>
						Página {currentPage + 1} de {totalPages || 1}
					</span>

					<button
						disabled={currentPage >= totalPages - 1}
						onClick={() => setCurrentPage((prev) => prev + 1)}
						className='btn-pagination'
						style={{
							background: 'white',
							border: '1px solid #ddd',
							padding: '0.5rem 1rem',
							borderRadius: '8px',
							cursor:
								currentPage >= totalPages - 1
									? 'not-allowed'
									: 'pointer',
							opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							fontWeight: '600',
						}}
					>
						Siguiente <FaChevronRight />
					</button>
				</div>
			</div>
		</section>
	);
}
