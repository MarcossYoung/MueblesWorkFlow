import React from 'react';
import OrdersTable from '../components/ordersTable';

export default function OrdersAll() {
	return (
		<section>
			<h1 className='main-title'>Todos los pedidos</h1>

			<OrdersTable endpoint='/api/products' />
		</section>
	);
}
