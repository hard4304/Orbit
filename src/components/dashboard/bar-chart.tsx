"use client";

interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  color?: string;
  unit?: string;
}

export function BarChart({ data, color = "#f9b4c2", unit = "" }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 28;
  const gap = 12;
  const chartHeight = 120;
  const labelHeight = 20;
  const valueHeight = 18;
  const totalWidth = data.length * (barWidth + gap) - gap;
  const totalHeight = chartHeight + labelHeight + valueHeight;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className="w-full"
      style={{ maxHeight: 180 }}
      preserveAspectRatio="xMidYMid meet"
    >
      {data.map((d, i) => {
        const x = i * (barWidth + gap);
        const barHeight = maxValue > 0 ? (d.value / maxValue) * chartHeight : 0;
        const barY = valueHeight + (chartHeight - barHeight);

        return (
          <g key={d.label}>
            {/* Value label */}
            {d.value > 0 && (
              <text
                x={x + barWidth / 2}
                y={barY - 4}
                textAnchor="middle"
                className="fill-foreground/70"
                fontSize="10"
                fontWeight="600"
              >
                {d.value % 1 === 0 ? d.value : d.value.toFixed(0)}
                {unit}
              </text>
            )}
            {/* Bar */}
            <rect
              x={x}
              y={barY}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              rx={4}
              fill={d.value > 0 ? color : "oklch(0.85 0.01 80)"}
              opacity={d.value > 0 ? 0.7 : 0.3}
            />
            {/* Day label */}
            <text
              x={x + barWidth / 2}
              y={totalHeight - 2}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="10"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
