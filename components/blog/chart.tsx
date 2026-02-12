"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartProps {
  children?: ReactNode;
  title?: string;
  type?: "line" | "bar" | "pie" | "area";
  data?: Array<Record<string, any>>;
  xAxis?: string;
  yAxis?: string;
  height?: number;
  colors?: string[];
  color?: string;
}

// Default color palette
const defaultColors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
];

export default function Chart({
  children,
  title,
  type = "line",
  data = [],
  xAxis = "name",
  yAxis = "value",
  height = 350,
  colors = defaultColors,
  color = "#8884d8",
  ...props
}: ChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const gridColor = isDark ? "#333" : "#e5e7eb";
  const axisColor = isDark ? "#a1a1aa" : "#6b7280";
  const tooltipBg = isDark ? "#1f1f1f" : "#fff";
  const tooltipBorder = isDark ? "#333" : "#e5e7eb";
  const tooltipText = isDark ? "#fafafa" : "#171717";

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey={xAxis} tick={{ fill: axisColor }} stroke={gridColor} />
              <YAxis tick={{ fill: axisColor }} stroke={gridColor} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText, borderRadius: "8px" }} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Bar dataKey={yAxis} fill={color}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                dataKey={yAxis}
                nameKey={xAxis}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={{ fill: axisColor }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText, borderRadius: "8px" }} />
              <Legend wrapperStyle={{ color: axisColor }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey={xAxis} tick={{ fill: axisColor }} stroke={gridColor} />
              <YAxis tick={{ fill: axisColor }} stroke={gridColor} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText, borderRadius: "8px" }} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Area
                type="monotone"
                dataKey={yAxis}
                fill={color}
                stroke={color}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default: // line chart
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey={xAxis} tick={{ fill: axisColor }} stroke={gridColor} />
              <YAxis tick={{ fill: axisColor }} stroke={gridColor} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText, borderRadius: "8px" }} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Line type="monotone" dataKey={yAxis} stroke={color} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="my-6">
      {title && (
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
        </div>
      )}
      <CardContent className="p-6">
        {renderChart()}
        {children}
      </CardContent>
    </Card>
  );
}
