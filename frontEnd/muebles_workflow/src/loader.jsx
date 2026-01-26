import React from 'react';
import './css/utils.css'; // Assuming you have utility classes here

const Loader = () => (
	<div
		style={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			height: '100vh',
			color: '#636e72',
		}}
	>
		<div className='loader-spinner'></div>
		<h3 style={{marginLeft: '10px'}}>Cargando MueblesWorkFlow...</h3>
	</div>
);

export default Loader;
