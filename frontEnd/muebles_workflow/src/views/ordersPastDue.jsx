import OrdersTable from '../components/ordersTable';
import {useOrders} from '../OrdersContext';
import {useEffect} from 'react';

export default function PastDue() {
	const {orders, fetchOrdersByRange, setOrders} = useOrders();

	useEffect(() => {
		const load = async () => {
			const data = await fetchOrdersByRange('');

			setOrders(
				data.filter((order) => order.workOrderStatus === 'ATRASADO')
			);
		};
		load();
	}, [fetchOrdersByRange, setOrders]);

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-semibold mb-4'>Pedidos atrasados</h1>
			<OrdersTable data={orders} />
		</div>
	);
}
