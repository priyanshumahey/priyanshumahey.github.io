"use client";

import { ReactNode } from "react";
import {
  Line,
  Bar,
  Pie,
  Area,
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

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
  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
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
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
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
