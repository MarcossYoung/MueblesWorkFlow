import React, {useState, useEffect, useContext, useCallback} from 'react';
import axios from 'axios';
import {FaTrashAlt, FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import {UserContext} from '../UserProvider'; // Ensure this path matches your file structure
import {BASE_URL} from '../api/config'; // Ensure this path matches your file structure

export default function OrdersTable({endpoint}) {
	const {user} = useContext(UserContext);

	// Data State
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);

	// Pagination & Search State
	const [currentPage, setCurrentPage] = useState(0); // 0-indexed for Spring Boot
	const [totalPages, setTotalPages] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [showMySales, setShowMySales] = useState(false);

	// Debounce search to prevent too many API calls
	const [debouncedSearch, setDebouncedSearch] = useState('');

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchTerm);
			setCurrentPage(0); // Reset to page 1 on new search
		}, 500);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	// FETCH DATA FUNCTION
	const fetchOrders = useCallback(async () => {
		if (!endpoint) return;

		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const res = await axios.get(`${BASE_URL}${endpoint}`, {
				headers: {Authorization: `Bearer ${token}`},
				params: {
					page: currentPage,
					size: 10, // Items per page
					query: debouncedSearch,
				},
			});

			// Handle Page Object (Server Side) vs List (Legacy)
			if (res.data.content) {
				setOrders(res.data.content);
				setTotalPages(res.data.totalPages);
			} else {
				// If endpoint returns a plain list (no pagination), handle gracefully
				setOrders(res.data);
				setTotalPages(1);
			}
		} catch (err) {
			console.error('Error fetching orders:', err);
		} finally {
			setLoading(false);
		}
	}, [endpoint, currentPage, debouncedSearch]);

	// Initial Load & Updates
	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	// HANDLERS
	const handleDelete = async (id) => {
		if (!window.confirm('¿Eliminar este pedido?')) return;
		try {
			const token = localStorage.getItem('token');
			await axios.delete(`${BASE_URL}/api/products/${id}`, {
				headers: {Authorization: `Bearer ${token}`},
			});
			fetchOrders(); // Reload table after delete
		} catch (err) {
			alert('Error al eliminar el pedido');
		}
	};

	const handleDetail = (id) => {
		window.location.href = `/products/${id}`;
	};

	const getRowClass = (status) => {
		if (status === 'TERMINADO') return 'row-terminado';
		if (status === 'ATRASADO') return 'row-atrasado';
		if (status === 'ENTREGADO') return 'row-entregado';
		return 'row-produccion';
	};

	// Client-side filter for "My Sales" (Applied to the current page data)
	// Safe check: (user?.id) ensures we don't crash if user is null
	const displayedOrders = showMySales
		? orders.filter(
				(o) => o.ownerId === user?.id || o.owner?.id === user?.id
		  )
		: orders;

	return (
		<div className='orders-container'>
			{/* --- CONTROLS BAR --- */}
			<div
				className='admin-tools flex justify-between align-center'
				style={{marginBottom: '1rem'}}
			>
				<div className='flex gap-8' style={{flex: 1}}>
					<input
						type='text'
						className='search-input'
						placeholder='Buscar por título, material...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						style={{maxWidth: '400px'}}
					/>
					<button
						onClick={() => setShowMySales(!showMySales)}
						className='button_3'
					>
						{showMySales ? 'Mostrar todo' : 'Ver mis ventas'}
					</button>
				</div>

				<div className='pagination-info'>
					Página <strong>{currentPage + 1}</strong> de{' '}
					{totalPages || 1}
				</div>
			</div>

			{/* --- TABLE --- */}
			<div className='table-wrapper box-shadow scrollable-table'>
				{loading ? (
					<div style={{padding: '2rem', textAlign: 'center'}}>
						Cargando...
					</div>
				) : (
					<table className='orders-table'>
						<thead>
							<tr>
								<th>Id</th>
								<th>Título</th>
								<th>Tipo</th>
								<th>Cant.</th>
								<th>Fecha inicio</th>
								<th>Fecha estimada</th>
								<th>Fecha entregada</th>
								<th>Dias de atraso</th>
								{user?.role === 'ADMIN' && <th>Acciones</th>}
							</tr>
						</thead>
						<tbody>
							{displayedOrders.length > 0 ? (
								displayedOrders.map((o) => (
									<tr
										key={o.id}
										className={getRowClass(
											o.workOrderStatus
										)}
										onClick={() => handleDetail(o.id)}
									>
										<td>{o.id}</td>
										<td className='truncate'>
											<strong>{o.titulo}</strong>
										</td>
										<td>{o.productType}</td>
										<td>{o.cantidad}</td>
										<td>{o.startDate || '—'}</td>
										<td>{o.fechaEstimada || '—'}</td>
										<td>{o.fechaEntregada || '—'}</td>
										<td>{o.daysLate || '—'}</td>
										{user?.role === 'ADMIN' && (
											<td
												onClick={(e) =>
													e.stopPropagation()
												}
											>
												<button
													className='button-red-icon'
													style={{
														background:
															'transparent',
														border: 'none',
														color: '#d63031',
														cursor: 'pointer',
													}}
													onClick={() =>
														handleDelete(o.id)
													}
												>
													<FaTrashAlt />
												</button>
											</td>
										)}
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan='13'
										style={{
											textAlign: 'center',
											padding: '40px',
										}}
									>
										No se encontraron pedidos.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				)}
			</div>

			{/* --- PAGINATION CONTROLS --- */}
			{totalPages > 1 && (
				<div
					className='pagination-container flex center gap-12 margin-top-24'
					style={{justifyContent: 'center', marginTop: '20px'}}
				>
					<button
						disabled={currentPage === 0}
						onClick={() => setCurrentPage((prev) => prev - 1)}
						className='btn-pagination'
					>
						<FaChevronLeft /> Anterior
					</button>

					<button
						disabled={currentPage >= totalPages - 1}
						onClick={() => setCurrentPage((prev) => prev + 1)}
						className='btn-pagination'
					>
						Siguiente <FaChevronRight />
					</button>
				</div>
			)}
		</div>
	);
}
