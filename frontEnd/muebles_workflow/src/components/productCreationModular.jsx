import React from 'react';
import ProductCreation from '../views/productCreateForm';

const ProductFormModal = ({isOpen, onClose}) => {
	if (!isOpen) return null;

	return (
		<div className='modal-overlay'>
			<div className='modal-content'>
				<ProductCreation isModal={true} onClose={onClose} />
			</div>
		</div>
	);
};

export default ProductFormModal;
