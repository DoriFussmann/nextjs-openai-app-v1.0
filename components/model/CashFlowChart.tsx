// components/model/CashFlowChart.tsx
"use client";

import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ModelState } from "@/lib/model/types";
import { buildCashFlowPreview } from "@/lib/model/projection";

export default function CashFlowChart({ state }: { state: ModelState }) {
  const proj = buildCashFlowPreview(state);

  const data = proj.months.map((m, i) => ({
    month: m,
    Revenue: proj.rows["Revenue"][i],
    EBITDA: proj.rows["EBITDA"][i],
    NetCash: proj.rows["Net Cash (v2)"][i],
  }));

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="text-base font-semibold mb-3">Cash Flow Chart</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(v: any) => Math.round(v).toLocaleString()} />
          <Legend />
          <Line type="monotone" dataKey="Revenue" stroke="#2563eb" />
          <Line type="monotone" dataKey="EBITDA" stroke="#16a34a" />
          <Line type="monotone" dataKey="NetCash" stroke="#dc2626" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

