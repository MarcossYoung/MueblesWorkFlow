import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useOrders} from '../OrdersContext';
import OrdersTable from '../components/ordersTable';
import {FaCalendarWeek, FaPlus} from 'react-icons/fa';
import {BASE_URL} from '../api/config';

export default function OrdersDueThisWeek({user}) {
	const {fetchOrdersByRange} = useOrders();
	const [orders, setOrders] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const isAdmin = user?.role === 'ADMIN';

	useEffect(() => {
		const load = async () => {
			const data = await fetchOrdersByRange('/due-this-week');
			setOrders(data);
		};
		load();
	}, [fetchOrdersByRange]);

	const handleAddOrder = async (e) => {
		e.preventDefault();
		if (!searchTerm.trim()) return;

		try {
			const res = await axios.post(
				`${BASE_URL}/api/products/add-existing`,
				{
					titulo: searchTerm,
				}
			);
			setOrders([...orders, res.data]);
			setSuccessMessage('✅ Pedido agregado con éxito.');
			setSearchTerm('');
			setTimeout(() => setSuccessMessage(''), 2500);
		} catch (err) {
			console.error('Error adding order:', err);
			setSuccessMessage('❌ Error al agregar el pedido.');
			setTimeout(() => setSuccessMessage(''), 2500);
		}
	};
	return (
		<section className='orders-due-container'>
			<div className='orders-header'>
				<h1 className='main-title'>
					<FaCalendarWeek /> Pedidos de Esta Semana
				</h1>
				<p className='subtitle'>
					Órdenes programadas para entrega dentro de la semana actual.
				</p>
			</div>

			{/* Admin Add Order Section */}
			{isAdmin && (
				<div className='add-order-section box-shadow'>
					<form onSubmit={handleAddOrder} className='add-order-form'>
						<input
							type='text'
							placeholder='Buscar pedido por título...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='add-order-input'
						/>
						<button type='submit' className='button-green'>
							<FaPlus /> Agregar
						</button>
					</form>
					{successMessage && (
						<p
							className={`add-order-message ${
								successMessage.includes('✅') ? 'green' : 'red'
							}`}
						>
							{successMessage}
						</p>
					)}
				</div>
			)}

			{/* Orders Table */}
			<div className='orders-table-wrapper box-shadow'>
				<OrdersTable data={orders} />
			</div>
		</section>
	);
}
