import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
	const {productId} = useParams();

	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);

	// Define checklist steps by product type
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
		MESA: ['Armado', 'Pulido', 'Pintura', 'Laqueado', 'Revisión final'],
	};

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const token = localStorage.getItem('token');
				const res = await axios.get(`/api/products/${productId}`, {
					headers: {Authorization: `Bearer ${token}`},
				});
				setProduct(res.data);
			} catch (err) {
				console.error('Error fetching product:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchProduct();
	}, [productId]);

	if (loading) return <p className='text-center'>Cargando...</p>;
	if (!product) return <p className='text-center'>Producto no encontrado.</p>;

	const steps =
		productionSteps[product.productType?.toUpperCase()] ||
		productionSteps['MESA'];

	return (
		<main className='background_amarillo'>
			<div className='product-wrapper w-85 margin-0auto padding-20 box-shadow bg-white'>
				<h1 className='main-title'>
					Checklist de Producción – {product.productType}
				</h1>

				<h2 className='margin-top-20'>Planilla de Producción</h2>
				<table className='details-table'>
					<tbody>
						<tr>
							<td>
								<strong>Título:</strong> {product.titulo}
							</td>
							<td>
								<strong>Material:</strong> {product.material}
							</td>
							<td>
								<strong>Color:</strong> {product.color}
							</td>
						</tr>
						<tr>
							<td>
								<strong>Medidas:</strong> {product.medidas}
							</td>
							<td>
								<strong>Pintura:</strong> {product.pintura}
							</td>
							<td>
								<strong>Laqueado:</strong> {product.laqueado}
							</td>
						</tr>
						<tr>
							<td>
								<strong>Cantidad:</strong> {product.cantidad}
							</td>
							<td>
								<strong>Fecha Estimada:</strong>{' '}
								{product.fechaEstimada}
							</td>
							<td>
								<strong>Precio:</strong> ${product.precio}
							</td>
						</tr>
					</tbody>
				</table>

				{/* --- CHECKLIST TABLE --- */}
				<table className='checklist-table'>
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
						{steps.map((step, index) => (
							<tr key={index}>
								<td>{index + 1}</td>
								<td>{step}</td>
								<td></td>
								<td>⬜</td>
								<td></td>
							</tr>
						))}
					</tbody>
				</table>

				{/* --- NOTES SECTION --- */}
				<div className='notes-section margin-top-20'>
					<h3>Notas</h3>
					<p className='notes-box'>{product.notas || 'Sin notas'}</p>
				</div>
			</div>
		</main>
	);
};

export default ProductDetail;
