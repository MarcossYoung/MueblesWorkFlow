export default function ComparisonBarChart({data, height = 250}) {
	const max = Math.max(
		1,
		...data.map((d) => Math.max(Number(d.income), Number(d.expenses)))
	);

	return (
		<svg
			viewBox={`0 0 1000 ${height}`}
			style={{width: '100%', height: 'auto'}}
		>
			<line
				x1='40'
				y1={height - 30}
				x2='960'
				y2={height - 30}
				stroke='#dfe6e9'
				strokeWidth='2'
			/>
			{data.map((d, i) => {
				const groupW = 920 / data.length;
				const barW = groupW * 0.35;
				const xBase = 40 + i * groupW;

				const hInc = ((height - 60) * d.income) / max;
				const hExp = ((height - 60) * d.expenses) / max;

				return (
					<g key={i}>
						{/* Income Bar (Green) */}
						<rect
							x={xBase + 5}
							y={height - 30 - hInc}
							width={barW}
							height={hInc}
							fill='#00b894'
							rx='3'
						/>
						{/* Expense Bar (Red) */}
						<rect
							x={xBase + barW + 10}
							y={height - 30 - hExp}
							width={barW}
							height={hExp}
							fill='#ff7675'
							rx='3'
						/>
						{/* Month Label */}
						<text
							x={xBase + groupW / 2}
							y={height - 5}
							fontSize='14'
							textAnchor='middle'
							fill='#636e72'
						>
							{d.label.split('-')[1]}
						</text>
					</g>
				);
			})}
		</svg>
	);
}
