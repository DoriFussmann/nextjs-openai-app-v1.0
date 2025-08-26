// components/model/CashFlowPreview.tsx
"use client";

import React from "react";
import type { ModelState } from "@/lib/model/types";
import { buildCashFlowPreview } from "@/lib/model/projection";
import CashFlowChart from "./CashFlowChart";

export default function CashFlowPreview({ state }: { state: ModelState }) {
  const proj = buildCashFlowPreview(state);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold">Cash Flow Preview (v2)</h3>
        <span
          className={[
            "text-xs px-2 py-1 rounded border",
            proj.ready
              ? "bg-green-50 text-green-700 border-green-300"
              : "bg-yellow-50 text-yellow-700 border-yellow-300",
          ].join(" ")}
        >
          {proj.ready ? "Ready" : "Assumptions Missing"}
        </span>
      </div>

      {!proj.ready && (
        <div className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
          <div className="font-semibold">Notes & Missing Inputs</div>
          <ul className="list-disc ml-5 mt-1">
            {proj.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 pr-3 font-medium">Line Item</th>
              {proj.months.map((m) => (
                <th key={m} className="py-2 pr-3 font-medium">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(proj.rows).map(([name, arr]) => (
              <tr key={name}>
                <td className="py-2 pr-3 font-medium">{name}</td>
                {arr.map((v, i) => (
                  <td key={i} className="py-2 pr-3 tabular-nums">
                    {Math.round(v).toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        v2 includes working capital adjustments (DSO/DPO/Inventory) for more accurate cash flow.
      </div>
      
      <CashFlowChart state={state} />
    </div>
  );
}
