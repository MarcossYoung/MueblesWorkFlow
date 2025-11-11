import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {BASE_URL} from '../api/config';

const ProductDetail = () => {
	const {productId} = useParams();

	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [statuses, setStatuses] = useState([]);

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

	const handleChange = (e) => {
		setForm({...form, [e.target.name]: e.target.value});
	};

	useEffect(() => {
		const loadData = async () => {
			try {
				const res = await axios.get(
					`${BASE_URL}/api/products/${productId}`
				);

				setProduct(res.data);

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
					status: res.data.workOrder.status || '',
				});
			} catch (err) {
				console.error('Error:', err);
			}
			setLoading(false);
		};

		const loadStatuses = async () => {
			try {
				const res = await axios.get(
					`${BASE_URL}/api/workorders/statuses`
				);
				setStatuses(res.data);
			} catch (err) {
				console.error(err);
			}
		};

		loadStatuses();
		loadData();
	}, [productId]);

	const saveChanges = async () => {
		setSaving(true);
		try {
			await axios.put(`${BASE_URL}/api/products/${productId}`, form);
			alert('✅ Cambios guardados');
		} catch (err) {
			console.error(err);
			alert('❌ Error al guardar');
		}
		setSaving(false);
	};

	if (loading) return <p className='text-center'>Cargando...</p>;
	if (!product) return <p className='text-center'>Producto no encontrado</p>;

	const productionSteps = {
		SILLA: [
			'Revisar estructura y nivelar patas',
			'Pulido y pintura',
			'Encintado completo',
			'Engomado parejo',
			'Tapizado y cierre',
			'Friselina y terminación',
			'Revisión final (nivel + limpieza)',
		],
	}[product.productType] || [
		'Armado',
		'Pulido',
		'Pintura',
		'Laqueado',
		'Revisión final',
	];

	return (
		<main className='background_amarillo'>
			<div className='product-wrapper w-85 margin-0auto padding-20 box-shadow bg-white'>
				<h1 className='main-title'>
					Checklist de Producción – {product.productType}
				</h1>

				{/* PRODUCT INFO */}
				<h2 className='margin-top-20'>Planilla de Producción</h2>
				<table className='details-table'>
					<tbody>
						<tr>
							<td>
								<strong>Título:</strong>
								<input
									className='editable'
									name='titulo'
									value={form.titulo}
									onChange={handleChange}
								/>
							</td>

							<td>
								<strong>Material:</strong>
								<input
									className='editable'
									name='material'
									value={form.material}
									onChange={handleChange}
								/>
							</td>

							<td>
								<strong>Color:</strong>
								<input
									className='editable'
									name='color'
									value={form.color}
									onChange={handleChange}
								/>
							</td>
						</tr>

						<tr>
							<td>
								<strong>Medidas:</strong>
								<input
									className='editable'
									name='medidas'
									value={form.medidas}
									onChange={handleChange}
								/>
							</td>

							<td>
								<strong>Pintura:</strong>
								<input
									className='editable'
									name='pintura'
									value={form.pintura}
									onChange={handleChange}
								/>
							</td>

							<td>
								<strong>Laqueado:</strong>
								<input
									className='editable'
									name='laqueado'
									value={form.laqueado}
									onChange={handleChange}
								/>
							</td>
						</tr>

						<tr>
							<td>
								<strong>Cantidad:</strong>
								<input
									className='editable no-spin'
									type='number'
									name='cantidad'
									value={form.cantidad}
									onChange={handleChange}
								/>
							</td>

							<td>
								<strong>Fecha Estimada:</strong>
								<input
									className='editable'
									type='date'
									name='fechaEstimada'
									value={form.fechaEstimada}
									onChange={handleChange}
								/>
							</td>
						</tr>

						<tr>
							<td>
								<strong>Status:</strong>
								<select
									className='editable'
									name='status'
									value={form.status}
									onChange={handleChange}
								>
									{statuses.map((s) => (
										<option key={s}>{s}</option>
									))}
								</select>
							</td>
						</tr>
					</tbody>
				</table>

				{/* CHECKLIST */}
				<table className='checklist-table margin-top-20'>
					<thead>
						<tr>
							<th>#</th>
							<th>Etapa</th>
							<th>Responsable</th>
							<th>Hecho</th>
							<th>Observaciones</th>
						</tr>
					</thead>
					<tbody>
						{productionSteps.map((step, i) => (
							<tr key={i}>
								<td>{i + 1}</td>
								<td>{step}</td>
								<td></td>
								<td>⬜</td>
								<td></td>
							</tr>
						))}
					</tbody>
				</table>

				{/* NOTES */}
				<h3 className='margin-top-20'>Notas</h3>
				<textarea
					className='notes-box editable'
					name='notas'
					value={form.notas}
					onChange={handleChange}
				/>

				<button
					className='button_1 margin-top-20'
					onClick={saveChanges}
					disabled={saving}
				>
					{saving ? 'Guardando...' : 'Guardar Cambios'}
				</button>
			</div>
		</main>
	);
};

export default ProductDetail;
