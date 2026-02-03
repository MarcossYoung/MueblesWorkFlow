import OrdersTable from '../components/ordersTable';

export default function PastDue() {
	return (
		<div className='p-6'>
			<h1 className='main-title'>Pedidos atrasados</h1>
			<OrdersTable endpoint={'/api/products/past-due'} />
		</div>
	);
}
