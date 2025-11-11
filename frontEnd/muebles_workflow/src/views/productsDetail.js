import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {BASE_URL} from '../api/config';

const ProductDetail = () => {
	const {productId} = useParams();

	const [product, setProduct] = useState(null);
	const [statuses, setStatuses] = useState([]);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [form, setForm] = useState({
		titulo: '',
		medidas: '',
		material: '',
		color: '',
		pintura: '',
		laqueado: '',
		cantidad: '',
		precio: '',
		fechaEstimada: '',
		notas: '',
		status: '',
	});

	// Load token
	const token = localStorage.getItem('token');

	// ---------------------------
	// Fetch Product + WorkOrder
	// ---------------------------
	const fetchProduct = async () => {
		try {
			const res = await axios.get(
				`${BASE_URL}/api/products/${productId}`,
				{
					headers: {Authorization: `Bearer ${token}`},
				}
			);

			setProduct(res.data);

			// Fill editable form
			setForm({
				titulo: res.data.titulo || '',
				medidas: res.data.medidas || '',
				material: res.data.material || '',
				color: res.data.color || '',
				pintura: res.data.pintura || '',
				laqueado: res.data.laqueado || '',
				cantidad: res.data.cantidad || '',
				precio: res.data.precio || '',
				fechaEstimada: res.data.fechaEstimada || '',
				notas: res.data.notas || '',
				status: res.data.status || '',
			});
		} catch (error) {
			console.error('Error fetching product:', error);
		} finally {
			setLoading(false);
		}
	};

	// ----------------------
	// Fetch status options
	// ----------------------
	const fetchStatuses = async () => {
		try {
			const res = await axios.get(`${BASE_URL}/api/workOrders/statuses`);
			setStatuses(res.data);
		} catch (error) {
			console.error('Error loading statuses:', error);
		}
	};

	useEffect(() => {
		fetchStatuses();
		fetchProduct();
	});

	// ----------------------
	// Handle Input Changes
	// ----------------------
	const handleChange = (e) => {
		setForm({
			...form,
			[e.target.name]: e.target.value,
		});
	};

	// ----------------------
	// Save Changes
	// ----------------------
	const saveChanges = async () => {
		setSaving(true);
		try {
			await axios.put(
				`${BASE_URL}/api/products/${productId}`,
				{
					...form,
				},
				{
					headers: {Authorization: `Bearer ${token}`},
				}
			);

			alert('✅ Cambios guardados correctamente');
			fetchProduct();
		} catch (error) {
			console.error('Error saving changes:', error);
			alert('❌ Error al guardar los cambios');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <p className='text-center'>Cargando...</p>;
	if (!product) return <p className='text-center'>Producto no encontrado.</p>;

	return (
		<main className='background_amarillo'>
			<div className='product-wrapper w-85 margin-0auto padding-20 box-shadow bg-white'>
				<h1 className='main-title'>Editar Pedido – {product.titulo}</h1>

				{/* PRODUCT FORM */}
				<h2 className='margin-top-20'>Datos del Producto</h2>
				<table className='details-table'>
					<tbody>
						<tr>
							<td>
								<strong>Título:</strong>
								<input
									name='titulo'
									value={form.titulo}
									onChange={handleChange}
									className='input-edit'
								/>
							</td>

							<td>
								<strong>Material:</strong>
								<input
									name='material'
									value={form.material}
									onChange={handleChange}
									className='input-edit'
								/>
							</td>

							<td>
								<strong>Color:</strong>
								<input
									name='color'
									value={form.color}
									onChange={handleChange}
									className='input-edit'
								/>
							</td>
						</tr>

						<tr>
							<td>
								<strong>Medidas:</strong>
								<input
									name='medidas'
									value={form.medidas}
									onChange={handleChange}
									className='input-edit'
								/>
							</td>

							<td>
								<strong>Pintura:</strong>
								<input
									name='pintura'
									value={form.pintura}
									onChange={handleChange}
									className='input-edit'
								/>
							</td>

							<td>
								<strong>Laqueado:</strong>
								<input
									name='laqueado'
									value={form.laqueado}
									onChange={handleChange}
									className='input-edit'
								/>
							</td>
						</tr>

						<tr>
							<td>
								<strong>Cantidad:</strong>
								<input
									type='number'
									name='cantidad'
									value={form.cantidad}
									onChange={handleChange}
									className='input-edit'
								/>
							</td>

							<td>
								<strong>Precio:</strong>
								<input
									type='number'
									name='precio'
									value={form.precio}
									onChange={handleChange}
									className='input-edit'
								/>
							</td>

							<td>
								<strong>Fecha Estimada:</strong>
								<input
									type='date'
									name='fechaEstimada'
									value={form.fechaEstimada}
									onChange={handleChange}
									className='input-edit'
								/>
							</td>
						</tr>
					</tbody>
				</table>

				{/* STATUS + WORK ORDER */}
				<h2 className='margin-top-40'>Estado de Producción</h2>
				<table className='details-table'>
					<tbody>
						<tr>
							<td>
								<strong>Status:</strong>
								<select
									name='status'
									value={form.status}
									onChange={handleChange}
									className='input-edit'
								>
									{statuses.map((s) => (
										<option key={s} value={s}>
											{s}
										</option>
									))}
								</select>
							</td>
						</tr>
					</tbody>
				</table>

				{/* NOTES */}
				<h2 className='margin-top-20'>Notas del Cliente</h2>
				<textarea
					name='notas'
					value={form.notas}
					onChange={handleChange}
					className='textarea-edit'
				/>

				{/* SAVE BUTTON */}
				<div className='margin-top-30'>
					<button
						className='button_1'
						onClick={saveChanges}
						disabled={saving}
					>
						{saving ? 'Guardando...' : 'Guardar Cambios'}
					</button>
				</div>
			</div>
		</main>
	);
};

export default ProductDetail;
