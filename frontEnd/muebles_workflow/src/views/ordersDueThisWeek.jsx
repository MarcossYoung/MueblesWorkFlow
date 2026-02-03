import React, {useState} from 'react';
import axios from 'axios';
import OrdersTable from '../components/ordersTable';
import {FaPlus} from 'react-icons/fa';
import {BASE_URL} from '../api/config';

export default function OrdersDueThisWeek({user}) {
	const [orders, setOrders] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const isAdmin = user?.role === 'ADMIN';

	const handleAddOrder = async (e) => {
		e.preventDefault();
		if (!searchTerm.trim()) return;

		try {
			const res = await axios.post(
				`${BASE_URL}/api/products/add-existing`,
				{
					titulo: searchTerm,
				},
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
		<div className='p-6'>
			<div className='orders-header'>
				<h1 className='main-title'>Produccion semana actual</h1>
			</div>

			{isAdmin && (
				<div className='add-order-section'>
					<form
						onSubmit={handleAddOrder}
						className='add-order-form w-100'
					>
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
							style={{width: '100%', marginTop: '10px'}}
						>
							{successMessage}
						</p>
					)}
				</div>
			)}

			{/* The Table Wrapper is now just for the table */}
			<OrdersTable endpoint={'/api/products/due-this-week'} />
		</div>
	);
}
