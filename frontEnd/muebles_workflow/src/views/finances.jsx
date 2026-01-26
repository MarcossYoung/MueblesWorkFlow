import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {UserContext} from '../UserProvider';
import {BASE_URL} from '../api/config';
import StatCard from '../components/statCard';
import ComparisonBarChart from '../components/comaprisonBarChart';
import ExpensePieChart from '../components/expensesPieChart';

export default function Finance() {
	const {user} = useContext(UserContext);
	const [financeData, setFinanceData] = useState(null);
	const [loading, setLoading] = useState(true);

	// Default to the current month
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
			2,
			'0'
		)}`;
	});

	useEffect(() => {
		const loadDashboard = async () => {
			setLoading(true);
			try {
				// Calculate start and end of month based on selectedMonth (YYYY-MM)
				const [year, month] = selectedMonth.split('-');
				const from = `${year}-${month}-01`;
				const to = new Date(year, month, 0).toISOString().split('T')[0];

				const res = await axios.get(`${BASE_URL}/api/finance`, {
					params: {from, to},
					headers: {Authorization: `Bearer ${user?.token}`},
				});

				setFinanceData(res.data);
			} catch (err) {
				console.error('Error fetching dashboard data:', err);
			} finally {
				setLoading(false);
			}
		};

		if (user?.token) {
			loadDashboard();
		}
	}, [selectedMonth, user?.token]);

	if (loading || !financeData)
		return <div className='loader'>Cargando Datos Financieros...</div>;

	return (
		<div
			style={{
				padding: '25px',
				backgroundColor: '#f5f6fa',
				minHeight: '100vh',
			}}
		>
			{/* 1. Header & Month Selector */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '30px',
				}}
			>
				<h2 style={{margin: 0, color: '#2d3436'}}>Panel Financiero</h2>
				<input
					type='month'
					value={selectedMonth}
					onChange={(e) => setSelectedMonth(e.target.value)}
					style={{
						padding: '10px',
						borderRadius: '8px',
						border: '1px solid #dfe6e9',
						boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
					}}
				/>
			</div>

			{/* 2. KPI Cards (Using FinanceDashboardResponse fields) */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
					gap: '20px',
					marginBottom: '30px',
				}}
			>
				<StatCard
					title='Ingresos Totales'
					value={financeData.totalIncome}
					icon='💰'
					borderColor='#00b894'
				/>
				<StatCard
					title='Gastos del Mes'
					value={financeData.monthlySpend}
					icon='💸'
					borderColor='#ff7675'
				/>
				<StatCard
					title='Efectivo / Depósitos'
					value={financeData.currentDeposits}
					icon='📥'
					borderColor='#0984e3'
				/>
				<StatCard
					title='Ganancia Neta'
					value={financeData.totalProfit}
					icon='📊'
					borderColor='#6c5ce7'
				/>
			</div>

			{/* 3. Charts Section */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1.5fr 1fr',
					gap: '25px',
				}}
			>
				{/* User Performance (Bar Chart) */}
				<div
					className='card-white'
					style={{
						background: 'white',
						padding: '25px',
						borderRadius: '15px',
						boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
					}}
				>
					<h3
						style={{
							marginTop: 0,
							marginBottom: '20px',
							color: '#636e72',
						}}
					>
						Rendimiento por Vendedor
					</h3>
					{/* Passing userStats which contains {label, unitsSold, income} */}
					<ComparisonBarChart data={financeData.userStats} />
				</div>

				{/* Expense Breakdown (Pie Chart) */}
				<div
					className='card-white'
					style={{
						background: 'white',
						padding: '25px',
						borderRadius: '15px',
						boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
					}}
				>
					<h3
						style={{
							marginTop: 0,
							marginBottom: '20px',
							color: '#636e72',
						}}
					>
						Distribución de Gastos
					</h3>
					<ExpensePieChart data={financeData.expenseBreakdown} />
				</div>
			</div>
		</div>
	);
}
