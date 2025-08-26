// lib/model/extract.ts

export type Extracted = Record<string, string | number | boolean>;

const PCT = /(-?\d{1,3}(?:\.\d+)?)\s*%/g;                 // 25%, 7.5 %
const MONEY = /\$?\s*(-?\d{1,3}(?:[,\d]{0,3})*(?:\.\d+)?)/g; // $120, 1,250.50
const MONTHS = /\b(\d{1,3})\s*(?:mo|month|months)\b/i;
const DAYS = /\b(\d{1,3})\s*(?:d|day|days)\b/i;

function parseNumber(s: string): number | null {
  const n = Number(String(s).replace(/,/g, ""));
  return isFinite(n) ? n : null;
}

/**
 * Super simple signal extraction from free text. We keep this heuristic on purpose.
 * Expand as needed.
 */
export function extractSignals(text: string): Extracted {
  const out: Extracted = {};
  const t = text.toLowerCase();

  // Revenue model
  if (/(subscription|recurring|saas)/i.test(text)) out["revenue_model"] = "subscription";
  if (/(transactional|per[- ]?order|per[- ]?unit|one[- ]?time)/i.test(text)) out["revenue_model"] = "transactional";

  // Lead source / paid
  if (/(paid|ads|facebook|meta|google ads|adwords|tiktok ads|performance marketing)/i.test(text)) out["lead_source"] = "paid";
  if (/(outbound|sales outreach|cold email|cold call)/i.test(text)) out["lead_source"] = "outbound";
  if (/(organic|seo|word of mouth|referrals)/i.test(text)) out["lead_source"] = "organic";

  // Percentages (first % becomes generic pct if context not known)
  const pcts: number[] = [];
  text.replace(PCT, (_, n) => {
    const v = parseNumber(n);
    if (v !== null) pcts.push(v);
    return "";
  });
  if (pcts.length) out["pct_1"] = pcts[0];

  // Money: pick first reasonably-sized money as price/AOV candidate
  const monies: number[] = [];
  text.replace(MONEY, (_, n) => {
    const v = parseNumber(n);
    if (v !== null) monies.push(v);
    return "";
  });
  if (monies.length) out["money_1"] = monies[0];

  // Sales cycle duration: months/days
  const m = MONTHS.exec(text);
  if (m) {
    const months = parseNumber(m[1]);
    if (months !== null) out["sales_cycle_months"] = months;
  }
  const d = DAYS.exec(text);
  if (!m && d) {
    const days = parseNumber(d[1]);
    if (days !== null) out["sales_cycle_days"] = days;
  }

  // Churn mention
  if (/\bchurn\b/i.test(text)) out["mentions_churn"] = true;

  // CAC mention
  if (/\bcac\b/i.test(text)) out["mentions_cac"] = true;

  return out;
}
