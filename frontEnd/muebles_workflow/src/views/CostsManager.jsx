import React, {useEffect, useState, useContext} from 'react';
import axios from 'axios';
import {UserContext} from '../UserProvider';
import {BASE_URL} from '../api/config';

// Helper to format currency
function money(n) {
	const val = Number(n || 0);
	return val.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'});
}

// Fixed BarChart with better visibility
function BarChart({
	title,
	subtitle,
	data,
	valueKey,
	height = 160,
	color = '#00b894',
}) {
	const max = Math.max(
		1,
		...data.map((d) => Math.abs(Number(d[valueKey] || 0)))
	);

	return (
		<div
			className='chart-container'
			style={{
				background: 'white',
				padding: '20px',
				borderRadius: '12px',
				boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
			}}
		>
			<div style={{marginBottom: '1rem'}}>
				<h3 style={{margin: 0, color: '#2d3436', fontSize: '1.1rem'}}>
					{title}
				</h3>
				{subtitle && (
					<p
						style={{
							margin: 0,
							color: '#636e72',
							fontSize: '0.85rem',
						}}
					>
						{subtitle}
					</p>
				)}
			</div>

			{data.length === 0 ? (
				<p style={{color: '#b2bec3'}}>No hay datos disponibles.</p>
			) : (
				<svg
					viewBox={`0 0 1000 ${height}`}
					style={{width: '100%', height: 'auto'}}
				>
					<line
						x1='0'
						y1={height - 25}
						x2='1000'
						y2={height - 25}
						stroke='#dfe6e9'
						strokeWidth='2'
					/>
					{data.map((d, i) => {
						const barW = 1000 / data.length;
						const x = i * barW + barW * 0.1;
						const w = barW * 0.8;
						const v = Number(d[valueKey] || 0);
						const h = ((height - 50) * Math.abs(v)) / max;
						const y = height - 25 - h;

						return (
							<g key={i}>
								<rect
									x={x}
									y={y}
									width={w}
									height={h}
									rx='4'
									fill={v >= 0 ? color : '#ff7675'}
								/>
								<text
									x={i * barW + barW / 2}
									y={height - 5}
									fontSize='20'
									textAnchor='middle'
									fill='#636e72'
								>
									{d.label}
								</text>
							</g>
						);
					})}
				</svg>
			)}
		</div>
	);
}

// KPI Card Component to fix background/text color clash
function StatCard({title, value, icon, borderColor}) {
	return (
		<div
			className='card'
			style={{
				background: '#ffffff',
				padding: '20px',
				borderRadius: '10px',
				borderLeft: `6px solid ${borderColor}`,
				boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				display: 'flex',
				alignItems: 'center',
				gap: '15px',
			}}
		>
			<span style={{fontSize: '2rem'}}>{icon}</span>
			<div>
				<h4
					style={{
						margin: 0,
						color: '#636e72',
						fontSize: '0.9rem',
						textTransform: 'uppercase',
					}}
				>
					{title}
				</h4>
				<p
					style={{
						margin: '5px 0 0',
						color: '#2d3436',
						fontSize: '1.4rem',
						fontWeight: 'bold',
					}}
				>
					{money(value)}
				</p>
			</div>
		</div>
	);
}

export default function Finance() {
	const {user} = useContext(UserContext);
	const [loading, setLoading] = useState(true);
	const [financeData, setFinanceData] = useState(null);
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
			2,
			'0'
		)}`;
	});

	useEffect(() => {
		let cancelled = false;
		const loadData = async () => {
			try {
				setLoading(true);
				const res = await axios.get(`${BASE_URL}/api/finance`, {
					params: {month: selectedMonth},
					headers: user?.token
						? {Authorization: `Bearer ${user.token}`}
						: {},
				});
				if (!cancelled) setFinanceData(res.data);
			} catch (err) {
				console.error(err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		loadData();
		return () => {
			cancelled = true;
		};
	}, [user?.token, selectedMonth]);

	if (loading && !financeData)
		return (
			<div
				style={{padding: '40px', textAlign: 'center', color: '#2d3436'}}
			>
				Cargando Finanzas...
			</div>
		);

	// Destructure directly from the root of res.data (Now that Backend is flat)
	const {
		totalIncome = 0,
		currentDeposits = 0,
		monthlySpend = 0,
		totalProfit = 0,
		incomeSeries = [],
		depositSeries = [],
		profitSeries = [],
	} = financeData || {};

	return (
		<div
			style={{
				padding: '30px',
				backgroundColor: '#f9f9f9',
				minHeight: '100vh',
			}}
		>
			<h1 style={{color: '#2d3436', marginBottom: '5px'}}>
				Panel de Finanzas
			</h1>
			<p style={{color: '#636e72', marginBottom: '30px'}}>
				Visualización del mes: <b>{selectedMonth}</b>
			</p>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
					gap: '20px',
					marginBottom: '40px',
				}}
			>
				<StatCard
					title='Ventas Totales'
					value={totalIncome}
					icon='💰'
					borderColor='#0984e3'
				/>
				<StatCard
					title='Cashflow (Señas)'
					value={currentDeposits}
					icon='📥'
					borderColor='#00b894'
				/>
				<StatCard
					title='Gastos'
					value={monthlySpend}
					icon='💸'
					borderColor='#d63031'
				/>
				<StatCard
					title='Utilidad'
					value={totalProfit}
					icon='📈'
					borderColor={totalProfit >= 0 ? '#6c5ce7' : '#e17055'}
				/>
			</div>

			<div style={{marginBottom: '30px'}}>
				<input
					type='month'
					value={selectedMonth}
					onChange={(e) => setSelectedMonth(e.target.value)}
					style={{
						padding: '10px',
						borderRadius: '5px',
						border: '1px solid #dfe6e9',
					}}
				/>
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
					gap: '25px',
				}}
			>
				<BarChart
					title='Ingresos por Ventas'
					subtitle='Basado en fechas de entrega'
					data={incomeSeries}
					valueKey='income'
					color='#0984e3'
				/>
				<BarChart
					title='Flujo de Caja'
					subtitle='Basado en cobro de señas'
					data={depositSeries}
					valueKey='deposits'
					color='#00b894'
				/>
				<BarChart
					title='Rentabilidad Neta'
					subtitle='Ingresos vs Gastos'
					data={profitSeries}
					valueKey='diff'
					color='#6c5ce7'
				/>
			</div>
		</div>
	);
}
