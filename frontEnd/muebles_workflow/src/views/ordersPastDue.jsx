import OrdersTable from '../components/ordersTable';

export default function PastDue() {
	return (
		<div className='p-6'>
			<h1 className='text-2xl font-semibold mb-4'>Pedidos atrasados</h1>
			<OrdersTable endpoint={'/api/products/past-due'} />
		</div>
	);
}
