// lib/model/hydrate.ts
import type { ModelState, Evidence } from "./types";
import { recomputeAll } from "./types";

/**
 * Map Company Data fields into evidence for relevant questions.
 * Expand these mappings as your Data Mapper schema grows.
 */
export function hydrateFromCompanyData(state: ModelState): ModelState {
  const cd = state.companyData;
  if (!cd || typeof cd !== "object") return state;

  const topics = state.topics.map((t) => {
    const keyQuestions = t.keyQuestions.map((q) => {
      const ev: Evidence[] = [];

      // Revenue model (business model topic)
      if (/bm_how_charge/.test(q.id) && cd.revenueModel) {
        ev.push({ source: "company_data", key: "revenue_model", value: cd.revenueModel, confidence: 0.9 });
      }

      // Pricing/AOV (revenue topic)
      if (/rev_price/.test(q.id) && (cd.avgOrderValue || cd.arpu)) {
        const val = cd.avgOrderValue ?? cd.arpu;
        ev.push({ source: "company_data", key: "price_or_aov", value: val, confidence: 0.9 });
      }

      // Volume driver proxies (orders/subscribers)
      if (/rev_volume_driver/.test(q.id) && (cd.avgMonthlyOrders || cd.activeSubscribers)) {
        const val = cd.avgMonthlyOrders ?? cd.activeSubscribers;
        ev.push({ source: "company_data", key: "volume_driver", value: val, confidence: 0.85 });
      }

      // Sales cycle / churn
      if (/rev_cycle_or_churn/.test(q.id)) {
        if (cd.salesCycleDays) {
          ev.push({ source: "company_data", key: "sales_cycle_days", value: cd.salesCycleDays, confidence: 0.9 });
        }
        if (cd.churnRatePct) {
          ev.push({ source: "company_data", key: "churn_pct", value: cd.churnRatePct, confidence: 0.85 });
        }
      }

      // COGS as % or per unit
      if (/cogs_model/.test(q.id)) {
        if (cd.cogsPct != null) {
          ev.push({ source: "company_data", key: "percentage", value: cd.cogsPct, confidence: 0.9 });
        } else if (cd.cogsPerUnit != null) {
          ev.push({ source: "company_data", key: "cogs_per_unit", value: cd.cogsPerUnit, confidence: 0.9 });
        }
      }

      // Headcount
      if (/tp_current_headcount/.test(q.id) && (cd.headcount || cd.fteByFunction)) {
        ev.push({ source: "company_data", key: "headcount", value: cd.headcount ?? cd.fteByFunction, confidence: 0.9 });
      }

      return ev.length ? { ...q, evidence: [...q.evidence, ...ev] } : q;
    });

    return { ...t, keyQuestions };
  });

  return recomputeAll({ ...state, topics });
}

