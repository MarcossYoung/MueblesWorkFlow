import React, {useState, useContext} from 'react';
import axios from 'axios';
import {FaBoxOpen, FaTrashAlt} from 'react-icons/fa';
import {UserContext} from '../UserProvider';
import {useOrders} from '../OrdersContext';

function OrdersTable({data}) {
	const {user} = useContext(UserContext);
	const {setOrders} = useOrders();
	const [searchTerm] = useState('');

	const token = localStorage.getItem('token');

	const handleDelete = async (id) => {
		if (!window.confirm('¿Eliminar este pedido?')) return;
		try {
			await axios.delete(`/api/products/${id}`, {
				headers: {Authorization: `Bearer ${token}`},
			});
			setOrders((prev) => prev.filter((o) => o.id !== id));
		} catch (err) {
			console.error('Error deleting order:', err);
			alert('Error al eliminar el pedido');
		}
	};
	const handleDetail = (id) => {
		window.location.href = `/products/${id}`;
	};

	const getRowClass = (status) => {
		if (status === 'TERMINADO') return 'row-done';
		if (status === 'ATRASADO') return 'row-late';
		if (status === 'ENTRGADO') return 'row-delivered';
		return 'row-inprogress';
	};

	const filteredData = data.filter((order) => {
		const search = searchTerm.toLowerCase();
		return (
			order.titulo.toLowerCase().includes(search) ||
			order.productType.toLowerCase().includes(search) ||
			order.material.toLowerCase().includes(search) ||
			order.color.toLowerCase().includes(search)
		);
	});

	const mySales = () => {
		return filteredData.filter((order) => order.ownerId === user.id);
	};

	return (
		<div className='orders-container'>
			<h1 className='main-title'>
				<FaBoxOpen /> Órdenes
			</h1>

			{user?.role === 'ADMIN' && (
				<div className='admin-tools'>
					<input
						type='text'
						placeholder='Buscar pedidos...'
						value={searchTerm}
						onChange={(e) => filteredData(e.target.value)}
					/>

					<button onClick={mySales} className='button_2 margin-top-8'>
						Ver mis ventas
					</button>
				</div>
			)}

			<div className='table-wrapper box-shadow scrollable-table'>
				<table className='orders-table'>
					<thead>
						<tr>
							<th>ID</th>
							<th>Imagen</th>
							<th>Título</th>
							<th>Tipo</th>
							<th>Medidas</th>
							<th>Material</th>
							<th>Pintura</th>
							<th>Color</th>
							<th>Laqueado</th>
							<th>Cantidad</th>
							<th>Fecha Inicio</th>
							<th>Fecha Entrega</th>
							{user?.role === 'ADMIN' && <th>Acciones</th>}
						</tr>
					</thead>
					<tbody>
						{data.length > 0 ? (
							data.map((o) => (
								<tr
									key={o.id}
									className={getRowClass(o.workOrder.status)}
									onClick={() => handleDetail(o.id)}
								>
									<td>{o.id}</td>
									<td className='truncate'>
										{o.foto || '—'}
									</td>
									<td className='truncate'>{o.titulo}</td>
									<td>{o.productType}</td>
									<td className='truncate'>{o.medidas}</td>
									<td className='truncate'>{o.material}</td>
									<td>{o.pintura}</td>
									<td>{o.color}</td>
									<td>{o.laqueado}</td>
									<td>{o.cantidad}</td>
									<td>{o.startDate || 'N/A'}</td>
									<td>{o.fechaEstimada || 'N/A'}</td>
									{user?.role === 'ADMIN' && (
										<td>
											<button
												className='button-red'
												onClick={() =>
													handleDelete(o.id)
												}
											>
												<FaTrashAlt /> Eliminar
											</button>
										</td>
									)}
								</tr>
							))
						) : (
							<tr>
								<td colSpan='12' style={{textAlign: 'center'}}>
									No se encontraron pedidos
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default OrdersTable;
