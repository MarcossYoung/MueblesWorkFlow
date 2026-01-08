import React, {useEffect, useContext} from 'react';
import axios from 'axios';
import {Outlet} from 'react-router-dom';
import {useOrders} from '../OrdersContext';
import {BASE_URL} from '../api/config';
import {UserContext} from '../UserProvider';
import {NavLink} from 'react-router-dom';

export default function Dashboard() {
	const {orders, setOrders} = useOrders();
	const {user} = useContext(UserContext);

	const linkClass = ({isActive}) =>
		isActive ? 'nav-pill active' : 'nav-pill';

	const isAdmin = user?.role === 'ADMIN';

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
				<nav style={{display: 'flex', gap: '10px'}}>
					{' '}
					{/* Horizontal layout for links */}
					<NavLink to='/dashboard' end className={linkClass}>
						Pedidos
					</NavLink>
					<NavLink to='due-this-week' className={linkClass}>
						Entregas esta semana
					</NavLink>
					{isAdmin && (
						<>
							<NavLink to='late' className={linkClass}>
								Atrasados
							</NavLink>
							<NavLink to='not-picked-up' className={linkClass}>
								No retirados
							</NavLink>
							{/* NEW: Add link for the Costs Manager we created */}
							<NavLink to='costs' className={linkClass}>
								Gestión de Gastos
							</NavLink>
						</>
					)}
				</nav>

				<div className='tab-content'>
					<Outlet context={orders} />
				</div>
			</main>
		</div>
	);
}
