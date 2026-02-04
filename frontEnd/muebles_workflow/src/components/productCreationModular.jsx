import React from 'react';
import ProductCreation from '../views/productCreateForm.jsx';

const ProductFormModal = ({isOpen, onClose}) => {
	if (!isOpen) return null;

	return (
		// El onClick aquí cierra el modal si cliclean en lo "oscuro"
		<div className='modal-overlay' onClick={onClose}>
			{/* stopPropagation evita que el click DENTRO del formulario cierre el modal */}
			<div className='modal-content' onClick={(e) => e.stopPropagation()}>
				{/* Pasamos onClose al form por si tiene un botón de 'Cancelar' interno */}
				<ProductCreation isModal={true} onClose={onClose} />
			</div>
		</div>
	);
};

export default ProductFormModal;
