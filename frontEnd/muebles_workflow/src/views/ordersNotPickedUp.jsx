import OrdersTable from '../components/ordersTable';
export default function OrdersNotPickedUp() {
	return (
		<div className='p-6'>
			<h1 className='text-2xl font-semibold mb-4'>
				Pedidos no retirados
			</h1>
			<OrdersTable endpoint={'/api/products/not-picked-up'} />
		</div>
	);
}
