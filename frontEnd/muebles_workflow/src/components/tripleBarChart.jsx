import React from 'react';

export default function TripleBarChart({data, height = 300}) {
	// Find the highest absolute value to scale the Y-axis
	const max = Math.max(
		1,
		...data.map((d) =>
			Math.max(Math.abs(d.income), Math.abs(d.deposits), Math.abs(d.diff))
		)
	);

	return (
		<div
			className='chart-container'
			style={{
				background: 'white',
				padding: '25px',
				borderRadius: '12px',
				boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					marginBottom: '20px',
				}}
			>
				<h3 style={{margin: 0, color: '#2d3436'}}>
					Comparativa Mensual
				</h3>
				<div style={{display: 'flex', gap: '15px', fontSize: '0.8rem'}}>
					<span style={{color: '#0984e3'}}>● Ventas</span>
					<span style={{color: '#00b894'}}>● Señas</span>
					<span style={{color: '#6c5ce7'}}>● Utilidad</span>
				</div>
			</div>

			<svg
				viewBox={`0 0 1200 ${height}`}
				style={{width: '100%', height: 'auto'}}
			>
				{/* Horizontal Grid Lines */}
				{[0, 0.25, 0.5, 0.75, 1].map((pct) => (
					<line
						key={pct}
						x1='40'
						y1={(height - 40) * pct}
						x2='1160'
						y2={(height - 40) * pct}
						stroke='#f1f2f6'
						strokeWidth='1'
					/>
				))}

				{/* Baseline */}
				<line
					x1='40'
					y1={height - 40}
					x2='1160'
					y2={height - 40}
					stroke='#dfe6e9'
					strokeWidth='2'
				/>

				{data.map((d, i) => {
					const groupW = 1120 / data.length;
					const xStart = 40 + i * groupW;
					const barW = (groupW * 0.7) / 3; // Width of one of the three bars
					const gap = groupW * 0.05;

					// Helper to calculate Y and Height
					const getBarProps = (val) => {
						const h = ((height - 60) * Math.abs(val)) / max;
						return {h, y: height - 40 - h};
					};

					const inc = getBarProps(d.income);
					const dep = getBarProps(d.deposits);
					const prf = getBarProps(d.diff);

					return (
						<g key={i}>
							{/* Income Bar */}
							<rect
								x={xStart + gap}
								y={inc.y}
								width={barW}
								height={inc.h}
								fill='#0984e3'
								rx='2'
							/>
							{/* Cashflow Bar */}
							<rect
								x={xStart + gap + barW + 2}
								y={dep.y}
								width={barW}
								height={dep.h}
								fill='#00b894'
								rx='2'
							/>
							{/* Profit Bar */}
							<rect
								x={xStart + gap + (barW + 2) * 2}
								y={prf.y}
								width={barW}
								height={prf.h}
								fill={d.diff >= 0 ? '#6c5ce7' : '#ff7675'}
								rx='2'
							/>

							{/* Month Label */}
							<text
								x={xStart + groupW / 2}
								y={height - 15}
								fontSize='14'
								textAnchor='middle'
								fill='#636e72'
								fontWeight='bold'
							>
								{d.label.split('-')[1]}{' '}
								{/* Just show the month number */}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}
