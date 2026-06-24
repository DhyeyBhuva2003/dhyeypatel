"use client";

import React, { useState } from "react";

interface ChartDataItem {
  label: string;
  value: number;
}

interface ChartCardProps {
  title: string;
  type: "line" | "bar" | "donut" | "area";
  data: ChartDataItem[];
  color?: "purple" | "blue" | "emerald" | "amber";
  description?: string;
}

export default function ChartCard({
  title,
  type,
  data,
  color = "purple",
  description,
}: ChartCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm flex flex-col justify-center items-center h-80">
        <span className="text-xs text-zinc-400">No chart data available</span>
      </div>
    );
  }

  // Color theme definitions
  const themeColors = {
    purple: {
      stroke: "#9333ea",
      fill: "rgba(147, 51, 234, 0.1)",
      fillSolid: "#c084fc",
      gradient: ["#a855f7", "#7e22ce"],
    },
    blue: {
      stroke: "#2563eb",
      fill: "rgba(37, 99, 235, 0.1)",
      fillSolid: "#60a5fa",
      gradient: ["#3b82f6", "#1d4ed8"],
    },
    emerald: {
      stroke: "#10b981",
      fill: "rgba(16, 185, 129, 0.1)",
      fillSolid: "#34d399",
      gradient: ["#10b981", "#047857"],
    },
    amber: {
      stroke: "#f59e0b",
      fill: "rgba(245, 158, 11, 0.1)",
      fillSolid: "#fbbf24",
      gradient: ["#f59e0b", "#b45309"],
    },
  };

  const activeTheme = themeColors[color] || themeColors.purple;

  // Global SVG Dimension calculations
  const width = 500;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map((d) => d.value));
  const maxValue = maxVal === 0 ? 10 : maxVal * 1.1; // Add 10% ceiling headroom

  // 1. Line and Area Math coordinates
  const points = data.map((item, index) => {
    const x = paddingLeft + (index * chartWidth) / Math.max(1, data.length - 1);
    const y = height - paddingBottom - (item.value * chartHeight) / maxValue;
    return { x, y, label: item.label, value: item.value };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${
          height - paddingBottom
        } L ${points[0].x} ${height - paddingBottom} Z`
      : "";

  // 2. Bar Chart parameters
  const barWidth = Math.min(36, (chartWidth / data.length) * 0.6);
  const barSpacing =
    data.length > 1
      ? (chartWidth - barWidth * data.length) / (data.length - 1)
      : chartWidth;

  // 3. Donut calculations
  const totalSum = data.reduce((sum, d) => sum + d.value, 0);

  const donutRadius = 55;
  const donutCenter = 110;
  const circumference = 2 * Math.PI * donutRadius;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-850 shadow-sm flex flex-col justify-between space-y-4">
      {/* Card Header */}
      <div>
        <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">
          {title}
        </h3>
        {description && <p className="text-xs text-zinc-400 mt-0.5">{description}</p>}
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Render Donut Layout */}
        {type === "donut" ? (
          <div className="flex flex-col sm:flex-row items-center justify-around py-4 gap-6">
            <svg width={220} height={220} className="shrink-0 select-none">
              <circle
                cx={donutCenter}
                cy={donutCenter}
                r={donutRadius}
                fill="transparent"
                stroke="var(--border-color, #e2e8f0)"
                className="dark:stroke-zinc-800"
                strokeWidth={14}
              />
              {data.map((item, index) => {
                const percent = totalSum > 0 ? (item.value / totalSum) * 100 : 0;
                const dashArray = `${(percent * circumference) / 100} ${circumference}`;
                
                const previousSum = data.slice(0, index).reduce((sum, d) => sum + d.value, 0);
                const accumulatedPercent = totalSum > 0 ? (previousSum / totalSum) * 100 : 0;
                const dashOffset = circumference - (accumulatedPercent * circumference) / 100;

                // Color themes inside donut segments
                const themeKeys: ("purple" | "blue" | "emerald" | "amber")[] = [
                  "purple",
                  "blue",
                  "emerald",
                  "amber",
                ];
                const key = themeKeys[index % themeKeys.length];
                const segmentColor = themeColors[key].stroke;

                const isHovered = hoveredIndex === index;

                return (
                  <circle
                    key={index}
                    cx={donutCenter}
                    cy={donutCenter}
                    r={donutRadius}
                    fill="transparent"
                    stroke={segmentColor}
                    strokeWidth={isHovered ? 18 : 14}
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${donutCenter} ${donutCenter})`}
                    style={{
                      transition: "stroke-width 0.2s ease, filter 0.2s ease",
                      filter: isHovered
                        ? `drop-shadow(0 0 6px ${segmentColor})`
                        : "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
              {/* Text indicator inside Center */}
              <text
                x={donutCenter}
                y={donutCenter - 4}
                textAnchor="middle"
                className="text-2xl font-black fill-zinc-900 dark:fill-white"
              >
                {hoveredIndex !== null
                  ? data[hoveredIndex].value
                  : totalSum}
              </text>
              <text
                x={donutCenter}
                y={donutCenter + 16}
                textAnchor="middle"
                className="text-[10px] font-bold uppercase tracking-wider fill-zinc-400"
              >
                {hoveredIndex !== null
                  ? data[hoveredIndex].label
                  : "Total"}
              </text>
            </svg>

            {/* Labels Indicators */}
            <div className="flex flex-col gap-2 shrink-0">
              {data.map((item, index) => {
                const percent = totalSum > 0 ? (item.value / totalSum) * 100 : 0;
                const themeKeys: ("purple" | "blue" | "emerald" | "amber")[] = [
                  "purple",
                  "blue",
                  "emerald",
                  "amber",
                ];
                const key = themeKeys[index % themeKeys.length];
                const segmentColor = themeColors[key].stroke;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-xl transition ${
                      hoveredIndex === index
                        ? "bg-zinc-50 dark:bg-zinc-950 scale-102"
                        : ""
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border"
                      style={{
                        backgroundColor: segmentColor,
                        borderColor: "rgba(255,255,255,0.15)",
                      }}
                    />
                    <div className="flex flex-col leading-none">
                      <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                        {item.value} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Render Line, Area, or Bar Layouts */
          <div>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto select-none"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id={`areaGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeTheme.stroke} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={activeTheme.stroke} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id={`barGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeTheme.gradient[0]} />
                  <stop offset="100%" stopColor={activeTheme.gradient[1]} />
                </linearGradient>
              </defs>

              {/* Y Axis Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const gridY = paddingTop + pct * chartHeight;
                const gridVal = Math.round(maxValue * (1 - pct));
                return (
                  <g key={idx} className="opacity-40">
                    <line
                      x1={paddingLeft}
                      y1={gridY}
                      x2={width - paddingRight}
                      y2={gridY}
                      stroke="var(--border-color, #e2e8f0)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      className="dark:stroke-zinc-800"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={gridY + 3.5}
                      textAnchor="end"
                      className="text-[9px] font-semibold fill-zinc-400"
                    >
                      {gridVal}
                    </text>
                  </g>
                );
              })}

              {/* Area path */}
              {type === "area" && points.length > 0 && (
                <path
                  d={areaD}
                  fill={`url(#areaGrad-${color})`}
                  className="transition-all duration-300"
                />
              )}

              {/* Line path */}
              {(type === "line" || type === "area") && points.length > 0 && (
                <path
                  d={pathD}
                  fill="transparent"
                  stroke={activeTheme.stroke}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Bars render */}
              {type === "bar" &&
                data.map((item, index) => {
                  const barHeight = (item.value * chartHeight) / maxValue;
                  const x =
                    paddingLeft +
                    index * (barWidth + barSpacing) +
                    (barSpacing > 0 ? 0 : 0);
                  const y = height - paddingBottom - barHeight;

                  const isHovered = hoveredIndex === index;

                  return (
                    <g key={index}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(2, barHeight)}
                        fill={`url(#barGrad-${color})`}
                        rx={3}
                        style={{
                          transition: "filter 0.2s ease, opacity 0.2s ease",
                          opacity:
                            hoveredIndex !== null && hoveredIndex !== index ? 0.6 : 1,
                          filter: isHovered
                            ? `drop-shadow(0 0 5px ${activeTheme.stroke})`
                            : "none",
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    </g>
                  );
                })}

              {/* Active data points for Line/Area */}
              {(type === "line" || type === "area") &&
                points.map((p, idx) => {
                  const isHovered = hoveredIndex === idx;
                  return (
                    <g key={idx}>
                      {/* Transparent trigger area */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={12}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                      {/* Visual point */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 5.5 : 3.5}
                        fill={isHovered ? activeTheme.stroke : "#fff"}
                        stroke={activeTheme.stroke}
                        strokeWidth={isHovered ? 2 : 2.5}
                        className="pointer-events-none transition-all duration-150"
                        style={{
                          filter: isHovered
                            ? `drop-shadow(0 0 4px ${activeTheme.stroke})`
                            : "none",
                        }}
                      />
                    </g>
                  );
                })}

              {/* X Axis Labels */}
              {data.map((item, index) => {
                let x = 0;
                if (type === "bar") {
                  x = paddingLeft + index * (barWidth + barSpacing) + barWidth / 2;
                } else {
                  x = paddingLeft + (index * chartWidth) / Math.max(1, data.length - 1);
                }

                return (
                  <text
                    key={index}
                    x={x}
                    y={height - paddingBottom + 16}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-zinc-400"
                  >
                    {item.label}
                  </text>
                );
              })}
            </svg>

            {/* Hover details display panel */}
            <div className="h-6 flex items-center justify-center text-xs font-semibold select-none">
              {hoveredIndex !== null ? (
                <span className="text-zinc-800 dark:text-zinc-200">
                  {data[hoveredIndex].label}:{" "}
                  <strong className="text-purple-600 dark:text-purple-400">
                    {data[hoveredIndex].value}
                  </strong>
                </span>
              ) : (
                <span className="text-zinc-400 font-medium">Hover chart segments for values</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
