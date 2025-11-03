import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const Register = () => {
	const navigate = useNavigate();
	const [userData, setUserData] = useState({
		username: '',
		password: '',
		rePassword: '',
	});
	const [responseMessage, setResponseMessage] = useState('');

	const handleChange = (e) => {
		const {name, value} = e.target;
		setUserData({...userData, [name]: value});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (userData.password !== userData.rePassword) {
			setResponseMessage('Passwords do not match!');
			return;
		}

		try {
			const response = await axios.post('/api/users/registro', {
				username: userData.username,
				password: userData.password,
				appUserRole: userData.appUserRole,
			});
			navigate('/login');
		} catch (error) {
			setResponseMessage('Error registering user.');
			console.error(error);
		}
	};

	return (
		<div className='container product-wrapper box-shadow background_amarillo'>
			<h1 className='main-title w-100'>Registro</h1>
			<form onSubmit={handleSubmit}>
				<div className='form-input'>
					<label className='main-label' htmlFor='username'>
						Usuario{' '}
					</label>
					<input
						id='username'
						type='text'
						name='username'
						value={userData.username}
						onChange={handleChange}
						required
					/>
				</div>

				<div className='form-input'>
					<label className='main-label' htmlFor='password'>
						Contraseña{' '}
					</label>
					<input
						id='password'
						type='password'
						name='password'
						value={userData.password}
						onChange={handleChange}
						required
					/>
				</div>
				<div className='form-input'>
					<label className='main-label'>Repetir Contraseña </label>
					<input
						id='appUserRole'
						type='text'
						name='appUserRole'
						value={userData.appUserRole}
						onChange={handleChange}
						required
					/>
				</div>
				<button type='submit'>Enviar</button>
			</form>
			<p>{responseMessage}</p>
		</div>
	);
};

export default Register;
