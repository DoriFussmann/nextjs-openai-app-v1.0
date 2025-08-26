// lib/model/projection.ts
import type { ModelState, Topic } from "./types";

type ProjectionResult = {
  ready: boolean;
  reasons: string[];
  months: string[];
  rows: Record<string, number[]>;
};

function monthLabels(n = 6): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const dt = new Date(d.getFullYear(), d.getMonth() + i, 1);
    out.push(dt.toLocaleString("en-US", { month: "short", year: "numeric" }));
  }
  return out;
}

function getTopic(state: ModelState, id: string): Topic | undefined {
  return state.topics.find(t => t.id === id);
}

function num(val: any): number | null {
  const n = typeof val === "string" ? Number(val.replace(/,/g, "")) : Number(val);
  return Number.isFinite(n) ? n : null;
}

function getEvidenceNumber(topic: Topic | undefined, keys: string[]): number | null {
  if (!topic) return null;
  for (const q of topic.keyQuestions) {
    for (const ev of q.evidence) {
      if (keys.includes(ev.key)) {
        const n = num(ev.value);
        if (n !== null) return n;
      }
    }
  }
  return null;
}

export function buildCashFlowPreview(state: ModelState): ProjectionResult {
  const reasons: string[] = [];
  const months = monthLabels(6);

  const tRevenue = getTopic(state, "revenue");
  const tCOGS = getTopic(state, "cogs");
  const tPayroll = getTopic(state, "team_payroll");
  const tOpEx = getTopic(state, "operating_expenses");
  const tWC = getTopic(state, "working_capital");

  // Inputs
  const priceOrAOV = getEvidenceNumber(tRevenue, ["price_or_aov"]) ?? num((state.companyData || {}).avgOrderValue);
  const volumeDriver = getEvidenceNumber(tRevenue, ["volume_driver"]);
  const cogsPct = getEvidenceNumber(tCOGS, ["percentage"]);
  const headcountCost = getEvidenceNumber(tPayroll, ["payroll_monthly"]);
  const opExBaseline = getEvidenceNumber(tOpEx, ["opex_monthly"]);

  // WC
  const dso = getEvidenceNumber(tWC, ["dso_days"]) ?? (state.companyData?.dsoDays ?? null);
  const dpo = getEvidenceNumber(tWC, ["dpo_days"]) ?? (state.companyData?.dpoDays ?? null);
  const inv = getEvidenceNumber(tWC, ["inventory_days"]) ?? (state.companyData?.inventoryDays ?? null);

  // Gating
  if (priceOrAOV === null) reasons.push("Missing price/ARPU/AOV");
  if (volumeDriver === null) reasons.push("Missing volume driver (orders/mo, active subs, etc.)");
  if (cogsPct === null) reasons.push("Missing COGS %");
  if (headcountCost === null) reasons.push("Payroll baseline missing");
  if (opExBaseline === null) reasons.push("OpEx baseline missing");

  const ready = reasons.length <= 2 && priceOrAOV !== null && volumeDriver !== null;

  // Defaults if missing
  const _price = priceOrAOV ?? 0;
  const _vol = volumeDriver ?? 0;
  const _cogsPct = (cogsPct ?? 0) / 100;
  const _payroll = headcountCost ?? 0;
  const _opex = opExBaseline ?? 0;

  // Simple flat projection
  const revenue = months.map(() => _price * _vol);
  const cogs = revenue.map(r => r * _cogsPct);
  const gross = revenue.map((r, i) => r - cogs[i]);
  const payroll = months.map(() => _payroll);
  const opex = months.map(() => _opex);
  const ebitda = months.map((_, i) => gross[i] - payroll[i] - opex[i]);

  // Working capital effect: shift AR (DSO), AP (DPO), Inventory
  const wcAdj = months.map((r, i) => {
    let adj = 0;
    if (dso != null && revenue[i]) adj -= (revenue[i] / 30) * dso; // receivables outflow
    if (dpo != null && cogs[i]) adj += (cogs[i] / 30) * dpo;       // payables inflow
    if (inv != null && cogs[i]) adj -= (cogs[i] / 30) * inv;       // inventory outflow
    return adj / 6; // spread across 6 months simplistically
  });

  const netCash = months.map((_, i) => ebitda[i] + wcAdj[i]);

  return {
    ready,
    reasons,
    months,
    rows: {
      "Revenue": revenue,
      "COGS": cogs,
      "Gross Profit": gross,
      "Payroll": payroll,
      "Operating Expenses": opex,
      "EBITDA": ebitda,
      "WC Adjustment": wcAdj,
      "Net Cash (v2)": netCash,
    },
  };
}
