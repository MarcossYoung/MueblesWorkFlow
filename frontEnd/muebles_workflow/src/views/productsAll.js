import React, {useEffect, useState} from 'react';
import axios from 'axios';
import OrdersTable from '../components/ordersTable';
import {BASE_URL} from '../api/config';

export default function OrdersAll() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		setLoading(true);
		axios
			.get(`${BASE_URL}/api/products`)
			.then((res) => setOrders(res.data.content || res.data))
			.catch((err) => setError(err))
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	return (
		<section>
			<h1 className='text-xl font-bold mb-3'>Todos los pedidos</h1>
			<OrdersTable data={orders} />
		</section>
	);
}
