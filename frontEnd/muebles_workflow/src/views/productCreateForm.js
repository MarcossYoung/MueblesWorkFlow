import {useState, useContext, useEffect} from 'react';
import axios from 'axios';
import {UserContext} from '../UserProvider';
import {useNavigate} from 'react-router-dom';
import {BASE_URL} from '../api/config';

const ProductCreation = ({isModal = false, onClose}) => {
	const navigate = useNavigate();
	const {user} = useContext(UserContext);
	const [types, setTypes] = useState([]);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const [productData, setProductData] = useState({
		titulo: '',
		tipo: '',
		medida: '',
		material: '',
		pintura: '',
		laqueado: '',
		color: '',
		precio: 0,
		cantidad: '',
		foto: '',
		terminado: false,
		notas: '',
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`${BASE_URL}/api/products/types`);
				setTypes(res.data);
			} catch (error) {
				console.error('Error fetching data', error);
			}
		};
		fetchData();
	}, []);

	const handleInputChange = (e) => {
		const {name, value} = e.target;
		setProductData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		const token = localStorage.token || '';
		const formData = new FormData();
		Object.entries(productData).forEach(([key, value]) => {
			formData.append(key, value);
		});

		try {
			await axios.post(`${BASE_URL}/api/products/create`, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'multipart/form-data',
				},
			});
			setSuccess(true);

			// If it’s in a modal, just close after success
			if (isModal && onClose) {
				setTimeout(onClose, 1200);
			} else {
				navigate('/');
			}
		} catch (error) {
			setError('Failed to create the product. Please try again.');
		}
	};

	return (
		<div className={`product-wrapper ${isModal ? 'modal-style' : ''}`}>
			{!isModal && <h1>Crear Nuevo Producto</h1>}
			{isModal && (
				<div className='modal-header'>
					<h2> Agregar Pedido</h2>
					<button className='close-btn' onClick={onClose}>
						×
					</button>
				</div>
			)}

			<form onSubmit={handleSubmit} className='form-grid'>
				<div className='form-input'>
					<label>Title</label>
					<input
						type='text'
						name='titulo'
						value={productData.titulo}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className='form-input'>
					<label>Tipo Mueble</label>
					<select
						name='tipo'
						value={productData.tipo}
						onChange={handleInputChange}
						required
					>
						<option value=''>Select Type</option>
						{types.map((Type) => (
							<option key={Type} value={Type}>
								{Type}
							</option>
						))}
					</select>
				</div>

				<div className='form-input'>
					<label>Material</label>
					<input
						type='text'
						name='material'
						value={productData.material}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className='form-input'>
					<label>Medidas</label>
					<input
						type='text'
						name='medida'
						value={productData.medida}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className='form-input'>
					<label>Pintura</label>
					<input
						type='text'
						name='pintura'
						value={productData.pintura}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className='form-input'>
					<label>Laqueado</label>
					<input
						type='text'
						name='laqueado'
						value={productData.laqueado}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className='form-input'>
					<label>Color</label>
					<input
						type='text'
						name='color'
						value={productData.color}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className='form-input'>
					<label>Precio</label>
					<input
						type='number'
						name='precio'
						value={productData.precio}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className='form-input'>
					<label>Cantidad</label>
					<input
						type='number'
						name='cantidad'
						value={productData.cantidad}
						onChange={handleInputChange}
						required
					/>
				</div>
				{/*<div className='form-input'>
					<label>Foto</label>
					<input
						type='file'
						name='foto'
						onChange={handleFileChange}
						accept='image/*'
						required
					/>
				</div>*/}
				<div className='form-input'>
					<label>Notas</label>
					<textarea
						name='notas'
						value={productData.notas}
						onChange={handleInputChange}
					></textarea>
				</div>

				<div className='form-input full-width text-center'>
					<button
						type='submit'
						className='button_1 margin-5'
						disabled={!productData.titulo || !productData.precio}
					>
						Create Product
					</button>
				</div>

				{error && <p className='error red'>{error}</p>}
				{success && (
					<p className='green'>Pedido creado correctamente!</p>
				)}
			</form>
		</div>
	);
};

export default ProductCreation;
