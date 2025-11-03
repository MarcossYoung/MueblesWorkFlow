import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';

const EditProduct = () => {
	const {productId} = useParams();
	const [types, setTypes] = useState([]);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState('');
	const [product, setProduct] = useState({
		titulo: '',
		tipo: '',
		medida: '',
		material: '',
		pintura: '',
		laqueado: '',
		color: '',
		precio: 0,
		cantidad: 0,
		startDate: '',
		fechaEstimada: '',
		foto: '',
		terminado: false,
		notas: '',
	});

	useEffect(() => {
		axios
			.get(`/api/products/${productId}`)
			.then((res) => setProduct(res.data))
			.catch((err) => console.error('Error fetching product:', err));
	}, [productId]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [typesRes] = await Promise.all([
					axios.get('/api/products/types'),
				]);
				setTypes(typesRes.data);
			} catch (error) {
				console.error('Error fetching data', error);
			}
		};
		fetchData();
	}, []);

	const handleChange = (e) => {
		const {name, value} = e.target;
		setProduct((prevProduct) => ({...prevProduct, [name]: value}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess(false);
		const formData = new FormData();
		Object.keys(product).forEach((key) => {
			formData.append(key, product[key]);
		});

		try {
			await axios.put(`/api/products/${productId}`, formData);
			setSuccess(true);
		} catch (err) {
			setError('Error updating product');
			console.error(err);
		}
	};

	return (
		<div className='product-wrapper w-65 margin-0auto'>
			<h1 className='main-title w-100'>
				Editar Producto {product.titulo}
			</h1>

			<article className='product flex box-shadow bg-white'>
				<form
					className='w-100'
					onSubmit={handleSubmit}
					encType='multipart/form-data'
				>
					<div className='form-input'>
						<label className='main-label'>
							Nombre del Producto
						</label>
						<input
							name='titulo'
							value={product.titulo}
							onChange={handleChange}
							required
						/>
					</div>
					<select className='form-input'>
						<label className='main-label'>tipo</label>
						<input
							name='tipo'
							value={product.tipo}
							onChange={handleChange}
							required
						/>
						{types.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
					<div className='form-input'>
						<label className='main-label'>Precio</label>
						<input
							type='number'
							name='precio'
							value={product.precio}
							onChange={handleChange}
						/>
					</div>
					<div className='form-input'>
						<label className='main-label'>Medidas</label>
						<input
							name='medida'
							value={product.medida}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='form-input'>
						<label className='main-label'>Material</label>
						<input
							name='material'
							value={product.material}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='form-input'>
						<label className='main-label'>Pintura</label>
						<input
							name='pintura'
							value={product.pintura}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='form-input'>
						<label className='main-label'>Laqueado</label>
						<input
							name='laqueado'
							value={product.laqueado}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='form-input'>
						<label className='main-label'>Color</label>
						<input
							name='color'
							value={product.color}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='form-input'>
						<label className='main-label'>Cantidad</label>
						<input
							name='cantidad'
							value={product.cantidad}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='form-input'>
						<label className='main-label'>Fecha Inicio</label>
						<input
							name='startDate'
							value={product.startDate}
							onChange={handleChange}
							required
						/>
					</div>{' '}
					<div className='form-input'>
						<label className='main-label'>Fecha Estimada</label>
						<input
							name='fechaEstimada'
							value={product.fechaEstimada}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='form-input'>
						<label className='main-label'>Terminado</label>
						<input
							name='terminado'
							type='checkbox'
							checked={product.terminado}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='text-center'>
						<button className='button_3 margin-5' type='reset'>
							Resetear
						</button>
						<button className='button_1 margin-5' type='submit'>
							Enviar
						</button>
					</div>
					{success && (
						<p
							className='success-message'
							style={{color: 'green', marginTop: '10px'}}
						>
							✅ Producto actualizado con éxito.
						</p>
					)}
					{error && (
						<p
							className='error-message'
							style={{color: 'red', marginTop: '10px'}}
						>
							{error}
						</p>
					)}
				</form>
			</article>
		</div>
	);
};

export default EditProduct;
