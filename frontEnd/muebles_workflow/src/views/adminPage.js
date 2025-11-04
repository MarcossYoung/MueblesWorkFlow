import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {FaUser, FaClipboardList, FaClock, FaCheckCircle} from 'react-icons/fa';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import ProductFormModal from '../components/productCreationModular';

function AdminPage() {
	const [summary, setSummary] = useState({
		totalUsers: 0,
		totalOrders: 0,
		finishedOrders: 0,
		dueThisWeek: 0,
	});

	const [chartData, setChartData] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [newUser, setNewUser] = useState({
		username: '',
		password: '',
		role: 'USER',
	});
	const [createMsg, setCreateMsg] = useState('');
	const [createError, setCreateError] = useState('');

	useEffect(() => {
		const fetchSummary = async () => {
			try {
				const token = localStorage.getItem('token');
				const res = await axios.get('/api/admin/summary', {
					headers: {Authorization: `Bearer ${token}`},
				});
				setSummary(res.data);
				setChartData([
					{name: 'Total Orders', value: res.data.totalOrders},
					{name: 'Finished', value: res.data.finishedOrders},
					{name: 'Due This Week', value: res.data.dueThisWeek},
				]);
			} catch (err) {
				console.error('Error fetching summary:', err);
			}
		};
		fetchSummary();
	}, []);

	const handleCreateUser = async (e) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('token');
			await axios.post(
				'/api/users/registro',
				{
					username: newUser.username,
					password: newUser.password,
					appUserRole: newUser.role,
				},
				{headers: {Authorization: `Bearer ${token}`}}
			);
			setCreateMsg('✅ Usuario creado correctamente');
			setNewUser({username: '', password: '', role: 'USER'});
			setTimeout(() => setCreateMsg(''), 3000);
			setShowModal(false);
		} catch (error) {
			console.error('Error creando usuario:', error);
			setCreateError('❌ Error al crear el usuario');
			setTimeout(() => setCreateError(''), 3000);
		}
	};

	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<div className='admin-dashboard main-content'>
			{/* Header */}
			<div className='dashboard-header'>
				<h1 className='main-title'>📊 Admin Dashboard</h1>
				<div className='margin-3 text-center'>
					<button
						className='button_3 margin-3'
						onClick={() => setShowModal(true)}
					>
						Agregar Usuario
					</button>

					<button
						className='button_3 margin-3'
						onClick={() => setIsModalOpen(true)}
					>
						Add New Order
					</button>

					<ProductFormModal
						isOpen={isModalOpen}
						onClose={() => setIsModalOpen(false)}
					/>
				</div>
				<div className='admin-dashboard'>
					{/* Summary Cards */}
					<div className='dashboard-cards'>
						<div className='card'>
							<FaUser className='card-icon' />
							<div className='card-info'>
								<h3>Total Users</h3>
								<p>{summary.totalUsers}</p>
							</div>
						</div>

						<div className='card'>
							<FaClipboardList className='card-icon' />
							<div className='card-info'>
								<h3>Total Orders</h3>
								<p>{summary.totalOrders}</p>
							</div>
						</div>

						<div className='card'>
							<FaClock className='card-icon' />
							<div className='card-info'>
								<h3>Due This Week</h3>
								<p>{summary.dueThisWeek}</p>
							</div>
						</div>

						<div className='card'>
							<FaCheckCircle className='card-icon' />
							<div className='card-info'>
								<h3>Finished Orders</h3>
								<p>{summary.finishedOrders}</p>
							</div>
						</div>
					</div>

					{/* Chart Section */}
					<div className='chart-container'>
						<h2>Orders Overview</h2>
						<ResponsiveContainer width='100%' height={300}>
							<BarChart
								data={chartData}
								margin={{
									top: 20,
									right: 30,
									left: 0,
									bottom: 5,
								}}
							>
								<XAxis dataKey='name' />
								<YAxis />
								<Tooltip />
								<Bar
									dataKey='value'
									fill='#00b894'
									radius={[10, 10, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Modal */}
					{showModal && (
						<div
							className='modal-overlay'
							onClick={() => setShowModal(false)}
						>
							<div
								className='modal-content'
								onClick={(e) => e.stopPropagation()}
							>
								<h2>Crear Nuevo Usuario</h2>
								<form
									onSubmit={handleCreateUser}
									className='form-input'
								>
									<label>Usuario</label>
									<input
										type='text'
										value={newUser.username}
										onChange={(e) =>
											setNewUser({
												...newUser,
												username: e.target.value,
											})
										}
										required
									/>
									<label>Contraseña</label>
									<input
										type='password'
										value={newUser.password}
										onChange={(e) =>
											setNewUser({
												...newUser,
												password: e.target.value,
											})
										}
										required
									/>
									<label>Rol</label>
									<select
										value={newUser.appUserRole}
										onChange={(e) =>
											setNewUser({
												...newUser,
												appUserRole: e.target.value,
											})
										}
									>
										<option value='USER'>Usuario</option>
										<option value='ADMIN'>
											Administrador
										</option>
									</select>
									<button
										type='submit'
										className='button_3 margin-5'
									>
										Crear Usuario
									</button>
									{createMsg && (
										<p className='green'>{createMsg}</p>
									)}
									{createError && (
										<p className='red'>{createError}</p>
									)}
								</form>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default AdminPage;
