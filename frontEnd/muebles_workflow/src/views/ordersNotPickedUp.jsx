import OrdersTable from '../components/ordersTable';
export default function OrdersNotPickedUp() {
	return (
		<div className='p-6'>
			<h1 className='main-title'>Pedidos no retirados</h1>
			<OrdersTable endpoint={'/api/products/not-picked-up'} />
		</div>
	);
}
