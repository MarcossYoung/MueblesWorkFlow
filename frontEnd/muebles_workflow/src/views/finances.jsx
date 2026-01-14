import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {UserContext} from '../UserProvider';
import {BASE_URL} from '../api/config';
import TripleBarChart from '../components/charts/TripleBarChart';
import StatCard from '../components/StatCard';

export default function Finance() {
	const {user} = useContext(UserContext);
	const [loading, setLoading] = useState(true);
	const [financeData, setFinanceData] = useState(null);
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

	useEffect(() => {
		const loadYearlyData = async () => {
			try {
				setLoading(true);
				// Backend needs to handle a 'year' param to return 12 months
				const res = await axios.get(`${BASE_URL}/api/finance/yearly`, {
					params: {year: selectedYear},
					headers: user?.token
						? {Authorization: `Bearer ${user.token}`}
						: {},
				});
				setFinanceData(res.data);
			} catch (err) {
				console.error('Error fetching yearly data:', err);
			} finally {
				setLoading(false);
			}
		};
		loadYearlyData();
	}, [selectedYear, user?.token]);

	// Data Preparation: Merge 3 series into 1 clusterable array
	const prepareComparisonData = () => {
		if (!financeData) return [];
		const {incomeSeries, depositSeries, profitSeries} = financeData;

		return incomeSeries.map((item, index) => ({
			label: item.label,
			income: item.income || 0,
			deposits: depositSeries[index]?.deposits || 0,
			diff: profitSeries[index]?.diff || 0,
		}));
	};

	if (loading)
		return (
			<div style={{padding: '50px', textAlign: 'center'}}>
				Cargando analíticas anuales...
			</div>
		);

	return (
		<div
			style={{
				padding: '30px',
				backgroundColor: '#f8f9fa',
				minHeight: '100vh',
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '30px',
				}}
			>
				<div>
					<h1 style={{margin: 0, color: '#2d3436'}}>
						Dashboard Anual
					</h1>
					<p style={{margin: 0, color: '#636e72'}}>
						Comparativa de rendimiento por mes
					</p>
				</div>

				<div
					style={{
						background: 'white',
						padding: '10px 20px',
						borderRadius: '8px',
						boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
					}}
				>
					<label style={{marginRight: '10px', fontWeight: 'bold'}}>
						Año:
					</label>
					<select
						value={selectedYear}
						onChange={(e) => setSelectedYear(e.target.value)}
						style={{
							border: 'none',
							fontSize: '1rem',
							outline: 'none',
							cursor: 'pointer',
						}}
					>
						{[2024, 2025, 2026].map((y) => (
							<option key={y} value={y}>
								{y}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Main KPI Row */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
					gap: '20px',
					marginBottom: '30px',
				}}
			>
				<StatCard
					title='Total Ventas'
					value={financeData?.totalIncome}
					icon='💰'
					borderColor='#0984e3'
				/>
				<StatCard
					title='Total Señas'
					value={financeData?.currentDeposits}
					icon='📥'
					borderColor='#00b894'
				/>
				<StatCard
					title='Resultado'
					value={financeData?.totalProfit}
					icon='📈'
					borderColor='#6c5ce7'
				/>
			</div>

			{/* The Clustered Chart */}
			<TripleBarChart data={prepareComparisonData()} height={350} />
		</div>
	);
}
