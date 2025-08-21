"use client";

import Link from "next/link";

export default function PortfolioAnalysisPage() {
  // No local state, no handlers. Purely presentational.

  return (
    <main className="w-full px-6 pb-16">
      {/* Header row (inherits global top nav separately) */}
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between py-6">
          <h1 className="text-xl md:text-2xl font-medium">Portfolio Analysis</h1>

          {/* Page-level navigation buttons (inert) */}
          <div className="flex gap-3">
            <button
              className="rounded-2xl border px-4 py-2 text-sm opacity-50 cursor-not-allowed"
              aria-disabled
              disabled
              title="Disabled on this page"
            >
              Reset
            </button>
            <Link
              href="/"
              className="rounded-2xl border px-4 py-2 text-sm"
              // Home link can be live navigation (safe & expected)
            >
              Home
            </Link>
          </div>
        </div>

        {/* Two-column layout (clone of Share Price structure) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Inputs */}
          <section className="lg:col-span-4">
            <div className="rounded-2xl border p-4">
              <h2 className="text-base md:text-lg mb-4">Portfolio Inputs</h2>

              {/* Inert dropdowns for this page only */}
              <label className="block text-sm mb-1">Portfolio Type</label>
              <select
                className="w-full rounded-xl border px-3 py-2 mb-4 bg-white opacity-80"
                disabled
                aria-disabled
                title="Visual-only on this page"
                defaultValue=""
              >
                <option value="" disabled>
                  Select…
                </option>
                <option>Tech Stocks</option>
                <option>Blue Chips</option>
                <option>Growth</option>
              </select>

              <label className="block text-sm mb-1">Time Range</label>
              <select
                className="w-full rounded-xl border px-3 py-2 bg-white opacity-80"
                disabled
                aria-disabled
                title="Visual-only on this page"
                defaultValue=""
              >
                <option value="" disabled>
                  Select…
                </option>
                <option>6 Months</option>
                <option>1 Year</option>
                <option>2 Years</option>
              </select>

              {/* Any other input placeholders go here, rendered inert */}
            </div>

            {/* Event boxes (visual-only) */}
            <div className="mt-6 rounded-2xl border p-4">
              <h3 className="text-sm mb-3">Events</h3>
              <ul className="space-y-2">
                <li className="rounded-xl border p-3 text-sm opacity-80">Earnings — Placeholder</li>
                <li className="rounded-xl border p-3 text-sm opacity-80">Dividends — Placeholder</li>
                <li className="rounded-xl border p-3 text-sm opacity-80">Guidance — Placeholder</li>
              </ul>
            </div>
          </section>

          {/* Right: Results */}
          <section className="lg:col-span-8">
            <div className="rounded-2xl border p-4">
              <h2 className="text-base md:text-lg mb-4">Analysis Results</h2>

              {/* Placeholder chart area */}
              <div className="h-64 md:h-80 rounded-xl border-2 border-dashed grid place-items-center">
                <span className="text-sm opacity-70">Chart Placeholder</span>
              </div>

              {/* Optional notes/summary box, visual-only */}
              <div className="mt-6 rounded-xl border p-4 text-sm opacity-80">
                Result summary placeholder. This page shows structure only; no interactive logic is wired.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}