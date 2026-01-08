import OrdersTable from '../components/ordersTable';
import {useOrders} from '../OrdersContext';
import {useEffect} from 'react';

export default function OrdersNotPickedUp() {
	const {orders, fetchOrdersByRange, setOrders} = useOrders();

	useEffect(() => {
		const load = async () => {
			const data = await fetchOrdersByRange('');
			setOrders(
				data.filter(
					(order) =>
						order.workOrderStatus === 'TERMINADO' &&
						order.fechaDeEntrega > Date.now()
				)
			);
		};
		load();
	}, [fetchOrdersByRange, setOrders]);

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-semibold mb-4'>
				Pedidos no retirados
			</h1>
			<OrdersTable data={orders} />
		</div>
	);
}
