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
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [aiDescription, setAiDescription] = useState('');
	const [aiLoading, setAiLoading] = useState(false);
	const [aiError, setAiError] = useState('');

	// Estado inicial alineado con ProductCreateRequest del Backend
	const [productData, setProductData] = useState({
		titulo: '',
		productType: '', // Antes 'type'. Backend espera: req.productType()
		medidas: '',
		material: '',
		pintura: '',
		laqueado: '', // Faltaba en el form visual
		color: '',
		precio: '', // Precio Total
		amount: '', // "Seña" o Adelanto. Backend: if (req.amount() != null) -> crea DEPOSIT
		cantidad: 1,
		startDate: new Date().toISOString().split('T')[0], // Backend usa esto para la fecha del depósito
		fechaEstimada: '', // Backend: req.fechaEstimada()
		notas: '',
		clientPhone: '',
		// ownerid no es necesario enviarlo, el backend lo saca del token (userService.getCurrentUser())
	});

	useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

	const handleImageChange = (e) => {
		const file = e.target.files[0] || null;
		setImageFile(file);
		setImagePreview(file ? URL.createObjectURL(file) : null);
	};

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

	const handleAiFill = async () => {
		if (!aiDescription.trim()) return;
		setAiLoading(true);
		setAiError('');
		try {
			const token = user?.token || localStorage.getItem('token');
			const res = await axios.post(
				`${BASE_URL}/api/ai/parse-order`,
				{description: aiDescription},
				{headers: {Authorization: `Bearer ${token}`}},
			);
			const fields = res.data;
			if (!fields || Object.keys(fields).length === 0) {
				setAiError('No se pudieron extraer datos. Intenta con más detalles.');
				return;
			}
			setProductData((prev) => {
				const updated = {...prev};
				Object.entries(fields).forEach(([k, v]) => {
					if (v !== null && v !== undefined) {
						const cur = prev[k];
						if (cur === '' || cur === 0 || cur == null) {
							updated[k] = v;
						}
					}
				});
				return updated;
			});
		} catch {
			setAiError('Error al contactar la IA. Intenta de nuevo.');
		} finally {
			setAiLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const {name, value} = e.target;
		setProductData((prevData) => ({
			...prevData,
			[name]:
				name === 'precio' || name === 'cantidad' || name === 'amount'
					? value === ''
						? ''
						: Number(value) // Manejo seguro de números
					: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		const token = user?.token || localStorage.token;

		// Preparar datos para enviar (limpiar campos vacíos si es necesario)
		const payload = {
			...productData,
			// Si amount es 0 o vacío, mandamos null para evitar crear un pago de $0 si así lo prefieres,
			// o lo mandamos tal cual si permites señas de $0. Aquí asumo que si hay valor, se manda.
			amount: productData.amount > 0 ? productData.amount : null,
		};

		try {
			const res = await axios.post(`${BASE_URL}/api/products/create`, payload, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (imageFile && res.data?.id) {
				try {
					const fd = new FormData();
					fd.append('file', imageFile);
					await axios.post(`${BASE_URL}/api/products/${res.data.id}/image`, fd,
						{ headers: { Authorization: `Bearer ${token}` } }
					);
				} catch (imgErr) {
					console.warn('Image upload failed (product was created):', imgErr);
				}
			}

			setSuccess(true);

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
					'Error al crear el producto. Intente nuevamente.',
			);
		}
	};

	return (
		<div
			className={`product-creation-container ${isModal ? 'is-modal' : ''}`}
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
				{/* AI AUTOFILL */}
				<details style={{marginBottom: '16px', border: '1px solid #dfe6e9', borderRadius: '8px', padding: '12px 16px'}}>
					<summary style={{cursor: 'pointer', fontWeight: '600', color: '#6c5ce7', fontSize: '0.9rem'}}>
						Completar con IA
					</summary>
					<div style={{marginTop: '12px'}}>
						<textarea
							value={aiDescription}
							onChange={(e) => setAiDescription(e.target.value)}
							rows={3}
							placeholder='Ej: Mesa de roble 180x90, precio 450000, seña 100000, para el 15 de abril'
							style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #dfe6e9', resize: 'vertical', fontSize: '0.875rem', boxSizing: 'border-box'}}
						/>
						{aiError && <p style={{color: '#e74c3c', fontSize: '0.8rem', margin: '4px 0'}}>{aiError}</p>}
						<button
							type='button'
							onClick={handleAiFill}
							disabled={aiLoading || !aiDescription.trim()}
							style={{marginTop: '8px', padding: '8px 16px', background: '#6c5ce7', color: 'white', border: 'none', borderRadius: '6px', cursor: aiLoading ? 'not-allowed' : 'pointer', opacity: aiLoading ? 0.7 : 1, fontSize: '0.875rem'}}
						>
							{aiLoading ? 'Completando...' : 'Completar campos'}
						</button>
					</div>
				</details>

				{/* FILA 1: Título y Tipo */}
				<div className='input-row'>
					<div className='input-group'>
						<label>Título</label>
						<input
							type='text'
							name='titulo'
							value={productData.titulo}
							onChange={handleInputChange}
							required
							placeholder='Ej: Mesa Ratona Industrial'
						/>
					</div>
					<div className='input-group'>
						<label>Tipo de Mueble</label>
						<select
							name='productType' // Corregido para matchear backend
							value={productData.productType}
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

				{/* FILA 2: Material y Medidas */}
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
							placeholder='Ej: 120x80x75'
						/>
					</div>
				</div>

				{/* FILA 3: Acabados (Pintura, Color, Laqueado) */}
				<div className='input-row'>
					<div className='input-group'>
						<label>Pintura</label>
						<input
							type='text'
							name='pintura'
							value={productData.pintura}
							onChange={handleInputChange}
						/>
					</div>
					<div className='input-group'>
						<label>Color</label>
						<input
							type='text'
							name='color'
							value={productData.color}
							onChange={handleInputChange}
						/>
					</div>
					<div className='input-group'>
						<label>Laqueado</label>
						<input
							type='text'
							name='laqueado'
							value={productData.laqueado}
							onChange={handleInputChange}
							placeholder='Ej: Mate / Brillante / No'
						/>
					</div>
				</div>

				{/* FILA 5: Económico (Precio, Seña, Cantidad) */}
				<div className='input-row'>
					<div className='input-group'>
						<label>Precio Total ($)</label>
						<input
							type='number'
							name='precio'
							value={productData.precio}
							onChange={handleInputChange}
							required
							min='0'
						/>
					</div>
					<div className='input-group'>
						<label>Seña / Adelanto ($)</label>
						<input
							type='number'
							name='amount' // Esto gatilla la creación del DEPOSIT en backend
							value={productData.amount}
							onChange={handleInputChange}
							placeholder='Opcional'
							min='0'
						/>
					</div>
					<div className='input-group' style={{flex: '0.5'}}>
						<label>Cant.</label>
						<input
							type='number'
							name='cantidad'
							value={productData.cantidad}
							onChange={handleInputChange}
							required
							min='1'
						/>
					</div>
				</div>
				<div className='input-group'>
					<label>Teléfono del Cliente</label>
					<input
						type='tel'
						name='clientPhone'
						value={productData.clientPhone}
						onChange={handleInputChange}
						placeholder='+54 11 1234-5678'
					/>
				</div>

				{/* FILA 6: Notas */}
				<div className='input-group full-width'>
					<label>Notas Adicionales</label>
					<textarea
						name='notas'
						value={productData.notas}
						onChange={handleInputChange}
						rows='3'
					></textarea>
				</div>

				<div className='input-group full-width'>
					<label>Foto del Pedido (opcional)</label>
					<input type='file' accept='.jpg,.jpeg,.png,.webp' onChange={handleImageChange} />
					{imagePreview && (
						<img
							src={imagePreview}
							alt='Vista previa'
							style={{
								marginTop: 8,
								maxWidth: '100%',
								maxHeight: 200,
								borderRadius: 5,
								objectFit: 'contain',
								border: '1px solid #dfe6e9',
							}}
						/>
					)}
				</div>

				<button
					type='submit'
					className='submit-button'
					disabled={!productData.titulo || !productData.precio}
				>
					Guardar Pedido
				</button>

				{error && <p className='error-text'>{error}</p>}
				{success && (
					<p className='success-text'>
						¡Pedido creado correctamente!
					</p>
				)}
			</form>
		</div>
	);
};

export default ProductCreation;
