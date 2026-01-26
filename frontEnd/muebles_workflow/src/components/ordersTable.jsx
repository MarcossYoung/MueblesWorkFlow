import React, {useState, useContext} from 'react';
import axios from 'axios';
import {FaTrashAlt, FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import {UserContext} from '../UserProvider';
import {useOrders} from '../OrdersContext';
import {BASE_URL} from '../api/config';

function OrdersTable({data}) {
	const {user} = useContext(UserContext);
	const {setOrders} = useOrders();

	const [searchTerm, setSearchTerm] = useState('');
	const [showMySales, setShowMySales] = useState(false);

	// Pagination State
	const [currentPage, setCurrentPage] = useState(1);
	const ordersPerPage = 13;

	const token = localStorage.getItem('token');

	const handleDelete = async (id) => {
		if (!window.confirm('¿Eliminar este pedido?')) return;
		try {
			await axios.delete(`${BASE_URL}/api/products/${id}`, {
				headers: {Authorization: `Bearer ${token}`},
			});
			setOrders((prev) => prev.filter((o) => o.id !== id));
		} catch (err) {
			console.error('Error deleting order:', err);
			alert('Error al eliminar el pedido');
		}
	};

	const handleDetail = (id) => {
		window.location.href = `/products/${id}`;
	};

	const getRowClass = (status) => {
		if (status === 'TERMINADO') return 'row-done';
		if (status === 'ATRASADO') return 'row-late';
		if (status === 'ENTREGADO') return 'row-delivered';
		return 'row-inprogress';
	};

	// 1. Filter by Search Term
	let filtered = data.filter((order) => {
		const search = searchTerm.toLowerCase();
		return (
			order.titulo?.toLowerCase().includes(search) ||
			order.productType?.toLowerCase().includes(search) ||
			order.material?.toLowerCase().includes(search) ||
			order.color?.toLowerCase().includes(search)
		);
	});

	// 2. Apply "My Sales" filter
	// Checks both direct ownerId and the nested owner object from your AppUser model
	if (showMySales) {
		filtered = filtered.filter(
			(order) => order.ownerId === user.id || order.owner?.id === user.id
		);
	}

	// 3. Pagination Calculation
	const totalPages = Math.ceil(filtered.length / ordersPerPage);
	const indexOfLastOrder = currentPage * ordersPerPage;
	const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
	const currentOrders = filtered.slice(indexOfFirstOrder, indexOfLastOrder);

	const paginate = (pageNumber) => setCurrentPage(pageNumber);

	return (
		<div className='orders-container'>
			<div className='admin-tools flex justify-between align-center'>
				<div className='flex gap-8'>
					<input
						type='text'
						className='search-input'
						placeholder='Buscar por título, material, color...'
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setCurrentPage(1); // Reset to first page on new search
						}}
					/>
					<button
						onClick={() => {
							setShowMySales(!showMySales);
							setCurrentPage(1);
						}}
						className='button_2'
					>
						{showMySales ? 'Mostrar todo' : 'Ver mis ventas'}
					</button>
				</div>

				<div className='pagination-info'>
					Página <strong>{currentPage}</strong> de {totalPages || 1}
				</div>
			</div>

			<div className='table-wrapper box-shadow scrollable-table'>
				<table className='orders-table'>
					<thead>
						<tr>
							<th>ID</th>
							<th>Imagen</th>
							<th>Título</th>
							<th>Tipo</th>
							<th>Medidas</th>
							<th>Material</th>
							<th>Pintura</th>
							<th>Color</th>
							<th>Laqueado</th>
							<th>Cant.</th>
							<th>Inicio</th>
							<th>Entrega</th>
							{user?.role === 'ADMIN' && <th>Acciones</th>}
						</tr>
					</thead>
					<tbody>
						{currentOrders.length > 0 ? (
							currentOrders.map((o) => (
								<tr
									key={o.id}
									className={getRowClass(o.workOrderStatus)}
									onClick={() => handleDetail(o.id)}
								>
									<td>{o.id}</td>
									<td className='truncate'>
										{o.foto || '—'}
									</td>
									<td className='truncate'>
										<strong>{o.titulo}</strong>
									</td>
									<td>{o.productType}</td>
									<td className='truncate'>{o.medidas}</td>
									<td className='truncate'>{o.material}</td>
									<td>{o.pintura}</td>
									<td>{o.color}</td>
									<td>{o.laqueado}</td>
									<td>{o.cantidad}</td>
									<td>{o.startDate || '—'}</td>
									<td>{o.fechaEstimada || '—'}</td>
									{user?.role === 'ADMIN' && (
										<td>
											<button
												className='button-red-icon'
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(o.id);
												}}
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
									No se encontraron pedidos con los filtros
									actuales.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className='pagination-container flex center gap-12 margin-top-24'>
					<button
						disabled={currentPage === 1}
						onClick={() => paginate(currentPage - 1)}
						className='btn-pagination'
					>
						<FaChevronLeft />
					</button>

					<div className='flex gap-8'>
						{[...Array(totalPages).keys()].map((num) => (
							<button
								key={num + 1}
								onClick={() => paginate(num + 1)}
								className={`btn-page-number ${
									currentPage === num + 1 ? 'active' : ''
								}`}
							>
								{num + 1}
							</button>
						))}
					</div>

					<button
						disabled={currentPage === totalPages}
						onClick={() => paginate(currentPage + 1)}
						className='btn-pagination'
					>
						<FaChevronRight />
					</button>
				</div>
			)}
		</div>
	);
}

export default OrdersTable;
