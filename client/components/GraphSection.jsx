"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GraphSection = ({ data }) => {
  const trendCounts = data.reduce((acc, stock) => {
    acc[stock.stock_trend] = (acc[stock.stock_trend] || 0) + 1;
    return acc;
  }, {});

  // Convert counts to an array for Recharts
  const trendData = Object.keys(trendCounts).map((key) => ({
    name: key,
    value: trendCounts[key],
  }));

  // Colors for the pie chart segments
  const COLORS = { Up: "#4CAF50", Down: "#F44336", Stable: "#FFC107" };

  return (
    <div className="w-full flex flex-col sm:p-4 my-10">
      <h1 className="text-2xl sm:text-3xl font-medium text-gray-600 ml-0.5">
        Analytics
      </h1>
      <div className="flex flex-col md:flex-row w-full mt-6">
        <div className="w-full">
          <h2 className="sm:text-xl text-lg font-medium text-gray-600">
            Volume of each stock
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 0, left: 50, bottom: 5 }}
            >
              <XAxis dataKey="stock_name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => value.toLocaleString()} />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Bar dataKey="trade_volume" fill="#8884d8" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full">
          <h2 className="sm:text-xl text-lg font-medium text-gray-600">
            Trend Distribution
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={trendData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {trendData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GraphSection;
