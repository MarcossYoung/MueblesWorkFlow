import React, {useEffect, useState, useCallback} from 'react';
import axios from 'axios';
import OrdersTable from '../components/ordersTable';
import {BASE_URL} from '../api/config';

export default function OrdersAll() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);

	// Pagination & Search State
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchInput, setSearchInput] = useState(''); // Controls the input field

	// Fetch Function
	const fetchOrders = useCallback(async () => {
		setLoading(true);
		try {
			// Send 'page' and 'query' to the backend
			const res = await axios.get(`${BASE_URL}/api/products`, {
				params: {
					page: currentPage,
					size: 10,
					query: searchTerm, // Matches @RequestParam in your Controller
				},
			});

			// Handle Page Object vs List
			if (res.data.content) {
				setOrders(res.data.content);
				setTotalPages(res.data.totalPages);
			} else {
				setOrders(res.data);
			}
		} catch (err) {
			console.error('Error fetching orders:', err);
		} finally {
			setLoading(false);
		}
	}, [currentPage, searchTerm]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	// Handlers
	const handleSearch = (e) => {
		e.preventDefault();
		setSearchTerm(searchInput); // Triggers the effect
		setCurrentPage(0); // Reset to first page on new search
	};

	const handlePageChange = (newPage) => {
		if (newPage >= 0 && newPage < totalPages) {
			setCurrentPage(newPage);
		}
	};

	return (
		<section className='orders-container'>
			<h1 className='main-title'>Todos los pedidos</h1>

			{/* --- ADMIN TOOLS (Search & Pagination Info) --- */}
			<div
				className='admin-tools'
				style={{
					marginBottom: '1rem',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				{/* Search Form */}
				<form
					onSubmit={handleSearch}
					style={{
						display: 'flex',
						gap: '10px',
						flex: 1,
						maxWidth: '500px',
					}}
				>
					<input
						type='text'
						placeholder='Buscar por título, material...'
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className='add-order-input' // Reusing your nice input style
					/>
					<button type='submit' className='button-green'>
						Buscar
					</button>
				</form>

				{/* Page Info */}
				<span style={{fontWeight: '600', color: '#636e72'}}>
					Página {currentPage + 1} de {totalPages || 1}
				</span>
			</div>

			{/* --- TABLE --- */}
			<div className='orders-table-wrapper box-shadow'>
				{loading ? (
					<p style={{padding: '2rem', textAlign: 'center'}}>
						Cargando...
					</p>
				) : (
					<OrdersTable data={orders} />
				)}
			</div>

			{/* --- PAGINATION CONTROLS --- */}
			{totalPages > 1 && (
				<div
					className='pagination-container'
					style={{
						marginTop: '20px',
						display: 'flex',
						gap: '10px',
						justifyContent: 'center',
					}}
				>
					<button
						className='button_3' // Reusing your blue button style
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 0}
						style={{
							opacity: currentPage === 0 ? 0.5 : 1,
							cursor:
								currentPage === 0 ? 'not-allowed' : 'pointer',
						}}
					>
						Anterior
					</button>

					<button
						className='button_3'
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage >= totalPages - 1}
						style={{
							opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
							cursor:
								currentPage >= totalPages - 1
									? 'not-allowed'
									: 'pointer',
						}}
					>
						Siguiente
					</button>
				</div>
			)}
		</section>
	);
}
