import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {UserContext} from '../UserProvider';
import {BASE_URL} from '../api/config';
import StatCard from '../components/statCard';
import ComparisonBarChart from '../components/comaprisonBarChart';
import ExpensePieChart from '../components/expensesPieChart';

// Add the StatCard and money helpers here...

export default function Finance() {
	const {user} = useContext(UserContext);
	const [financeData, setFinanceData] = useState(null);
	const [chartData, setChartData] = useState([]);

	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
			2,
			'0'
		)}`;
	});

	useEffect(() => {
		fetch('/api/finance/user-performance')
			.then((res) => res.json())
			.then((data) => setChartData(data)); // Ensure keys: userName, unitsSold, income
	}, []);

	useEffect(() => {
		const load = async () => {
			const res = await axios.get(`${BASE_URL}/api/finance`, {
				params: {month: selectedMonth},
				headers: {Authorization: `Bearer ${user?.token}`},
			});
			setFinanceData(res.data);
		};
		load();
	}, [selectedMonth, user?.token]);

	if (!financeData) return <div className='loader'>Cargando...</div>;

	return (
		<div
			style={{
				padding: '25px',
				backgroundColor: '#f5f6fa',
				minHeight: '100vh',
			}}
		>
			{/* 1. KPIs */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
					gap: '20px',
					marginBottom: '30px',
				}}
			>
				<StatCard
					title='Ingresos'
					value={financeData.totalIncome}
					icon='💰'
					borderColor='#00b894'
				/>
				<StatCard
					title='Gastos'
					value={financeData.monthlySpend}
					icon='💸'
					borderColor='#ff7675'
				/>
				<StatCard
					title='Depósitos'
					value={financeData.currentDeposits}
					icon='📥'
					borderColor='#0984e3'
				/>
				<StatCard
					title='Neto'
					value={financeData.totalProfit}
					icon='📊'
					borderColor='#6c5ce7'
				/>
			</div>

			{/* 2. Controls */}
			<div style={{marginBottom: '25px'}}>
				<input
					type='month'
					value={selectedMonth}
					onChange={(e) => setSelectedMonth(e.target.value)}
					style={{
						padding: '10px',
						borderRadius: '8px',
						border: '1px solid #ddd',
					}}
				/>
			</div>

			{/* 3. Concept B: Side-by-Side Charts */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1.5fr 1fr',
					gap: '25px',
				}}
			>
				{/* Left: Comparison Bar Chart */}
				<div
					className='card-white'
					style={{
						background: 'white',
						padding: '20px',
						borderRadius: '12px',
					}}
				>
					<h3 style={{marginTop: 0}}>Ingresos vs Gastos</h3>
					<ComparisonBarChart data={chartData} />
				</div>

				{/* Right: Expense Pie Chart */}
				<div
					className='card-white'
					style={{
						background: 'white',
						padding: '20px',
						borderRadius: '12px',
					}}
				>
					<h3 style={{marginTop: 0}}>Distribución de Gastos</h3>
					<ExpensePieChart data={financeData.expenseBreakdown} />
				</div>
			</div>
		</div>
	);
}

// Simple SVG Pie Chart implementation
