import React, {useEffect, useState} from 'react';
import axios from 'axios';

const Filters = ({onFilterChange}) => {
	const [productTypes, setProductTypes] = useState([]);
	const [selectedProductType, setSelectedProductType] = useState('');

	useEffect(() => {
		// Fetch product types
		axios
			.get('/api/products/types')
			.then((response) => setProductTypes(response.data))
			.catch((error) =>
				console.error('Error fetching product types:', error)
			);
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		onFilterChange({productType: selectedProductType});
	};

	return (
		<form onSubmit={handleSubmit} className='filters'>
			<label>
				Tipo de Mueble:
				<select
					value={selectedProductType}
					onChange={(e) => setSelectedProductType(e.target.value)}
				>
					<option value=''>Tipo de Mueble</option>
					{productTypes.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</label>
			<button type='submit'>Aplicar Filtros</button>
		</form>
	);
};

export default Filters;
