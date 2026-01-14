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
		type: '', // Matches backend ENUM/Column
		medidas: '', // Matches DB Column
		material: '',
		pintura: '',
		laqueado: '',
		color: '',
		precio: 0,
		cantidad: 1,
		notas: '',
		ownerid: user?.id, // Link to the user creating the order
	});

	useEffect(() => {
		const fetchTypes = async () => {
			try {
				const res = await axios.get(`${BASE_URL}/api/products/types`);
				setTypes(res.data);
			} catch (error) {
				console.error('Error fetching types', error);
			}
		};
		fetchTypes();
	}, []);

	const handleInputChange = (e) => {
		const {name, value} = e.target;
		setProductData((prevData) => ({
			...prevData,
			// Ensure numbers stay numbers for the database
			[name]:
				name === 'precio' || name === 'cantidad'
					? Number(value)
					: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		const token = user?.token || localStorage.token;

		try {
			// Standard JSON post
			await axios.post(`${BASE_URL}/api/products/create`, productData, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			setSuccess(true);

			// UI feedback before closing/navigating
			setTimeout(() => {
				if (isModal && onClose) {
					onClose();
				} else {
					navigate('/');
				}
			}, 1500);
		} catch (error) {
			console.error(error);
			setError(
				error.response?.data?.message ||
					'Error al crear el producto. Intente nuevamente.'
			);
		}
	};

	return (
		<div
			className={`product-creation-container ${
				isModal ? 'is-modal' : ''
			}`}
		>
			<div className='form-header'>
				<h2>{isModal ? 'Nuevo Pedido' : 'Crear Producto'}</h2>
				{isModal && (
					<button className='close-x' onClick={onClose}>
						&times;
					</button>
				)}
			</div>

			<form onSubmit={handleSubmit} className='creation-form'>
				<div className='input-row'>
					<div className='input-group'>
						<label>Título</label>
						<input
							type='text'
							name='titulo'
							value={productData.titulo}
							onChange={handleInputChange}
							required
						/>
					</div>
					<div className='input-group'>
						<label>Tipo de Mueble</label>
						<select
							name='type'
							value={productData.type}
							onChange={handleInputChange}
							required
						>
							<option value=''>Seleccionar...</option>
							{types.map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className='input-row'>
					<div className='input-group'>
						<label>Material</label>
						<input
							type='text'
							name='material'
							value={productData.material}
							onChange={handleInputChange}
							required
						/>
					</div>
					<div className='input-group'>
						<label>Medidas</label>
						<input
							type='text'
							name='medidas'
							value={productData.medidas}
							onChange={handleInputChange}
							required
						/>
					</div>
				</div>

				<div className='input-row'>
					<div className='input-group'>
						<label>Pintura</label>
						<input
							type='text'
							name='pintura'
							value={productData.pintura}
							onChange={handleInputChange}
							required
						/>
					</div>
					<div className='input-group'>
						<label>Color</label>
						<input
							type='text'
							name='color'
							value={productData.color}
							onChange={handleInputChange}
							required
						/>
					</div>
				</div>

				<div className='input-row'>
					<div className='input-group'>
						<label>Precio Total</label>
						<input
							type='number'
							name='precio'
							value={productData.precio}
							onChange={handleInputChange}
							required
						/>
					</div>
					<div className='input-group'>
						<label>Cantidad</label>
						<input
							type='number'
							name='cantidad'
							value={productData.cantidad}
							onChange={handleInputChange}
							required
						/>
					</div>
				</div>

				<div className='input-group full-width'>
					<label>Notas</label>
					<textarea
						name='notas'
						value={productData.notas}
						onChange={handleInputChange}
						rows='3'
					></textarea>
				</div>

				<button
					type='submit'
					className='submit-button'
					disabled={!productData.titulo || productData.precio <= 0}
				>
					Guardar Pedido
				</button>

				{error && <p className='error-text'>{error}</p>}
				{success && (
					<p className='success-text'>¡Registrado correctamente!</p>
				)}
			</form>
		</div>
	);
};

export default ProductCreation;
