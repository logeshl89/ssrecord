"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { Transaction } from "@/lib/types";
import { useMemo } from "react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { format } from "date-fns";

interface OverviewChartProps {
  data: Transaction[];
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
  const monthlyData = useMemo(() => {
    const months: { [key: string]: { sales: number; purchases: number } } = {};
    
    data.forEach((transaction) => {
      const month = format(new Date(transaction.date), "MMM");
      if (!months[month]) {
        months[month] = { sales: 0, purchases: 0 };
      }
      if (transaction.type === "Sale") {
        months[month].sales += transaction.amountWithGST;
      } else {
        months[month].purchases += transaction.amountWithGST;
      }
    });

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return monthOrder.map((month) => ({
      name: month,
      sales: months[month]?.sales || 0,
      purchases: months[month]?.purchases || 0,
    })).filter(d => d.sales > 0 || d.purchases > 0);

  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
