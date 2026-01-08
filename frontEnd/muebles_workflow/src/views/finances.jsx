import React, {useEffect, useState, useContext, useMemo} from 'react';
import axios from 'axios';
import {UserContext} from '../UserProvider';
import {BASE_URL} from '../api/config';

function money(n) {
	const val = Number(n || 0);
	return val.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'});
}

// Simple SVG bar chart (same as your original)
function BarChart({title, subtitle, data, valueKey, height = 160}) {
	const max = Math.max(
		1,
		...data.map((d) => Math.abs(Number(d[valueKey] || 0)))
	);

	return (
		<div className='chart-container'>
			<div style={{marginBottom: '0.6rem'}}>
				<h3 style={{margin: 0, color: '#2d3436'}}>{title}</h3>
				{subtitle ? (
					<p className='subtitle' style={{margin: '0.25rem 0 0'}}>
						{subtitle}
					</p>
				) : null}
			</div>

			{data.length === 0 ? (
				<p className='subtitle'>No hay datos todavía.</p>
			) : (
				<svg
					viewBox={`0 0 1000 ${height}`}
					style={{width: '100%', height: `${height}px`}}
				>
					<line
						x1='0'
						y1={height - 20}
						x2='1000'
						y2={height - 20}
						stroke='#e5e7eb'
						strokeWidth='2'
					/>
					{data.map((d, i) => {
						const barW = 1000 / data.length;
						const gap = Math.min(10, barW * 0.15);
						const x = i * barW + gap;
						const w = barW - gap * 2;
						const v = Number(d[valueKey] || 0);
						const h = ((height - 45) * Math.abs(v)) / max;
						const y = height - 20 - h;

						return (
							<g key={d.key || i}>
								<rect
									x={x}
									y={y}
									width={w}
									height={h}
									rx='6'
									fill={v >= 0 ? '#00b894' : '#ff7675'}
								/>
								<text
									x={i * barW + barW / 2}
									y={height - 5}
									fontSize='22'
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

export default function Finance() {
	const {user} = useContext(UserContext);
	const [loading, setLoading] = useState(true);
	const [financeData, setFinanceData] = useState(null);

	// Controlled month selector (defaults to current month YYYY-MM)
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
			2,
			'0'
		)}`;
	});

	useEffect(() => {
		let cancelled = false;

		const loadFinanceData = async () => {
			try {
				setLoading(true);
				// Call your FinanceController endpoint
				const res = await axios.get(`${BASE_URL}/api/finance`, {
					params: {month: selectedMonth},
					headers: user?.token
						? {Authorization: `Bearer ${user.token}`}
						: undefined,
				});

				if (!cancelled) {
					setFinanceData(res.data);
				}
			} catch (err) {
				console.error('Error loading finance data:', err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		loadFinanceData();
		return () => {
			cancelled = true;
		};
	}, [user?.token, selectedMonth]);

	if (loading && !financeData) {
		return (
			<div className='admin-dashboard'>
				<div className='dashboard-header'>
					<h1 className='main-title'>Finanzas</h1>
					<p className='subtitle'>Cargando datos del servidor...</p>
				</div>
			</div>
		);
	}

	// Map your FinanceDashboardResponse fields to the UI
	// Note: Assuming your backend DTO has fields like: totalIncome, currentDeposits, monthlySpend, totalProfit, etc.
	const {
		totalIncome = 0,
		currentDeposits = 0,
		monthlySpend = 0,
		totalProfit = 0,
		incomeSeries = [], // Expecting Array of { label, income }
		depositSeries = [], // Expecting Array of { label, deposits }
		profitSeries = [], // Expecting Array of { label, diff }
	} = financeData || {};

	return (
		<div className='admin-dashboard'>
			<div className='dashboard-header'>
				<h1 className='main-title'>Finanzas</h1>
				<p className='subtitle'>
					Datos calculados por el servidor para el período:{' '}
					<b>{selectedMonth}</b>
				</p>
			</div>

			{/* KPI cards */}
			<div className='dashboard-cards'>
				<div className='card'>
					<div className='card-icon'>💰</div>
					<div className='card-info'>
						<h3>Ingreso total</h3>
						<p>{money(totalIncome)}</p>
					</div>
				</div>

				<div className='card'>
					<div className='card-icon'>📆</div>
					<div className='card-info'>
						<h3>Cashflow (Depósitos)</h3>
						<p>{money(currentDeposits)}</p>
					</div>
				</div>

				<div className='card'>
					<div className='card-icon'>🧾</div>
					<div className='card-info'>
						<h3>Gastos</h3>
						<p>{money(monthlySpend)}</p>
					</div>
				</div>

				<div className='card'>
					<div className='card-icon'>📈</div>
					<div className='card-info'>
						<h3>Balance</h3>
						<p>{money(totalProfit)}</p>
					</div>
				</div>
			</div>

			{/* Controls */}
			<div
				className='admin-tools'
				style={{marginBottom: '1.5rem', display: 'flex', gap: '1rem'}}
			>
				<div style={{display: 'flex', flexDirection: 'column'}}>
					<label style={{fontSize: '0.8rem', marginBottom: '0.3rem'}}>
						Seleccionar Mes
					</label>
					<input
						type='month'
						value={selectedMonth}
						onChange={(e) => setSelectedMonth(e.target.value)}
					/>
				</div>
			</div>

			{/* Charts grid */}
			<div className='finance-grid'>
				<BarChart
					title='Ingreso por mes'
					subtitle='Suma basada en fecha de entrega'
					data={incomeSeries}
					valueKey='income'
				/>

				<BarChart
					title='Depósitos por mes'
					subtitle='Suma basada en fecha de inicio'
					data={depositSeries}
					valueKey='deposits'
				/>

				<BarChart
					title='Diferencia Mensual'
					subtitle='Ingresos vs Gastos'
					data={profitSeries}
					valueKey='diff'
				/>

				<div className='chart-container'>
					<h3 style={{margin: 0, color: '#2d3436'}}>
						Resumen Período Seleccionado
					</h3>
					<div
						className='dashboard-cards'
						style={{marginBottom: 0, marginTop: '1rem'}}
					>
						<div className='card'>
							<div className='card-info'>
								<h3>Ingresos</h3>
								<p>{money(totalIncome)}</p>
							</div>
						</div>
						<div className='card'>
							<div className='card-info'>
								<h3>Balance</h3>
								<p
									style={{
										color:
											totalProfit >= 0
												? '#27ae60'
												: '#e74c3c',
									}}
								>
									{money(totalProfit)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
