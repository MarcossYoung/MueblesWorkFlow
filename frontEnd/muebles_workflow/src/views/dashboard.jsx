import React, {useEffect} from 'react';
import axios from 'axios';
import {Outlet} from 'react-router-dom';
import {useOrders} from '../OrdersContext';
import {BASE_URL} from '../api/config';

export default function Dashboard() {
	const {orders, setOrders} = useOrders();

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const res = await axios.get(`${BASE_URL}/api/products`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							'token'
						)}`,
					},
				});
				console.log('Fetched all orders:', res.data);
				setOrders(res.data.content);
			} catch (err) {
				console.error('Error fetching orders:', err);
			}
		};
		fetchOrders();
	}, [setOrders]);

	return (
		<div className='dashboard-layout flex'>
			<main className='dashboard-content w-100 p-3'>
				<Outlet data={orders} />
			</main>
		</div>
	);
}
