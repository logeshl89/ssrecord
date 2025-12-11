"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from "react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { format } from "date-fns";

interface MonthlyData {
  month: string;
  sales: number;
  purchases: number;
}

interface OverviewChartProps {
  data: MonthlyData[];
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  purchases: {
    label: "Purchases",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function OverviewChart({ data }: OverviewChartProps) {
  const chartData = useMemo(() => {
    // Process the monthly data directly
    return data.map(item => ({
      name: item.month,
      sales: parseFloat(item.sales) || 0,
      purchases: parseFloat(item.purchases) || 0,
    }));
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="name"
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${Number(value) / 1000}k`}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent
              indicator="dot"
              labelFormatter={(label) => `Month: ${label}`}
              formatter={(value, name) => {
                const formattedValue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number);
                return [formattedValue, name === 'sales' ? 'Sales' : 'Purchases'];
              }}
            />}
          />
          <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} name="Sales" />
          <Bar dataKey="purchases" fill="var(--color-purchases)" radius={[4, 4, 0, 0]} name="Purchases" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}