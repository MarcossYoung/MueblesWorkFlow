import React, {useState, useEffect, useContext, useCallback} from 'react';
import axios from 'axios';
import {
	FaTrashAlt,
	FaChevronLeft,
	FaChevronRight,
	FaFilter,
	FaPlus,
} from 'react-icons/fa';
import {UserContext} from '../UserProvider';
import {BASE_URL} from '../api/config';
import ProductFormModal from './productCreationModular';

export default function OrdersTable({endpoint}) {
	const {user} = useContext(UserContext);

	// States
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [showMySales, setShowMySales] = useState(false);

	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fetch Data
	const fetchOrders = useCallback(async () => {
		if (!endpoint) return;

		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const res = await axios.get(`${BASE_URL}${endpoint}`, {
				headers: {Authorization: `Bearer ${token}`},
				params: {page: currentPage, size: 10},
			});

			if (res.data.content) {
				setOrders(res.data.content);
				setTotalPages(res.data.totalPages);
			} else {
				setOrders(res.data);
				setTotalPages(1);
			}
		} catch (err) {
			console.error('Error fetching orders:', err);
		} finally {
			setLoading(false);
		}
	}, [endpoint, currentPage]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	// Función para cerrar el modal y refrescar la tabla
	const handleModalClose = () => {
		setIsModalOpen(false);
		fetchOrders(); // <-- IMPORTANTE: Recarga los datos al cerrar
	};

	// Handlers
	const handleDelete = async (id) => {
		if (!window.confirm('¿Eliminar este pedido?')) return;
		try {
			const token = localStorage.getItem('token');
			await axios.delete(`${BASE_URL}/api/products/${id}`, {
				headers: {Authorization: `Bearer ${token}`},
			});
			fetchOrders();
		} catch (err) {
			alert('Error al eliminar');
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

	// Filter Logic
	const getProcessedOrders = () => {
		let result = orders;
		if (searchTerm) {
			const search = searchTerm.toLowerCase();
			result = result.filter(
				(o) =>
					o.titulo?.toLowerCase().includes(search) ||
					o.productType?.toLowerCase().includes(search) ||
					o.material?.toLowerCase().includes(search) ||
					o.color?.toLowerCase().includes(search),
			);
		}
		if (showMySales) {
			result = result.filter(
				(o) => o.ownerId === user?.id || o.owner?.id === user?.id,
			);
		}
		return result;
	};

	const displayedOrders = getProcessedOrders();

	return (
		// Usamos una clase nueva para evitar doble margen
		<div className='orders-view-container'>
			{/* --- TOP BAR --- */}
			<div className='admin-tools'>
				<input
					type='text'
					placeholder='Buscar por título, material, color...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>

				<button
					onClick={() => setShowMySales(!showMySales)}
					className={`btn-pill ${showMySales ? 'active' : ''}`}
				>
					<FaFilter size={14} />
					{showMySales ? 'Todos los Pedidos' : 'Ver Mis Ventas'}
				</button>

				<button
					className='btn-pill'
					onClick={() => setIsModalOpen(true)}
					style={{
						backgroundColor: '#00b894',
						color: 'white',
						border: 'none',
					}}
				>
					<FaPlus size={12} />
					Agregar Pedido
				</button>
			</div>

			{/* --- TABLE (Fills remaining space) --- */}
			<div className='table-wrapper full-height'>
				{loading ? (
					<div className='text-center' style={{padding: '2rem'}}>
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
								<th>Inicio</th>
								<th>Estimada</th>
								<th>Entrega</th>
								<th>Días Atraso</th>
								{user?.role === 'ADMIN' && <th>Acciones</th>}
							</tr>
						</thead>
						<tbody>
							{displayedOrders.length > 0 ? (
								displayedOrders.map((o) => (
									<tr
										key={o.id}
										className={getRowClass(
											o.workOrderStatus,
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
										<td>{o.fechaEntrega || '—'}</td>
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
														color: '#EF4444',
														cursor: 'pointer',
														fontSize: '1.2rem',
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
										colSpan='10'
										className='text-center'
										style={{padding: '2rem', color: '#888'}}
									>
										No se encontraron pedidos.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				)}
			</div>

			{/* --- FOOTER PAGINATION --- */}
			<div className='pagination-container'>
				<button
					disabled={currentPage === 0}
					onClick={() => setCurrentPage((prev) => prev - 1)}
					className='btn-pagination'
				>
					<FaChevronLeft /> Anterior
				</button>

				<span>
					Página <strong>{currentPage + 1}</strong> de{' '}
					{totalPages || 1}
				</span>

				<button
					disabled={currentPage >= totalPages - 1}
					onClick={() => setCurrentPage((prev) => prev + 1)}
					className='btn-pagination'
				>
					Siguiente <FaChevronRight />
				</button>
			</div>

			{/* --- MODAL (Fuera del flujo normal) --- */}
			<ProductFormModal isOpen={isModalOpen} onClose={handleModalClose} />
		</div>
	);
}
