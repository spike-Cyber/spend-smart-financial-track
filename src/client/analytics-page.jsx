import React from "react";
import { BarChartCard, PieChartCard, TrendChartCard, BarGrowthIllustration, PieChartIllustration, TrendSparkIllustration } from "./visuals";
import { formatCurrency } from "./utils";
export function AnalyticsPage({
  transactions,
  expenseCategoryData,
  incomeCategoryData,
  monthlyTrendData,
  expenseTotal,
  incomeTotal,
  investmentTotal
}) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Data analyse feature</p>
          <h2 className="page-title">Analytics</h2>
          <p className="helper">Graphs, pie chart, and bar views based on your live finance data.</p>
        </div>
      </div>

      <div className="stat-grid">
        <article className="metric-card success">
          <span className="muted">Transactions analysed</span>
          <strong>{transactions.length}</strong>
          <p className="helper">Total records included in charts.</p>
        </article>
        <article className="metric-card">
          <span className="muted">Income analysed</span>
          <strong>{formatCurrency(incomeTotal)}</strong>
          <p className="helper">Used in bars and trend graph.</p>
        </article>
        <article className="metric-card danger">
          <span className="muted">Expenses analysed</span>
          <strong>{formatCurrency(expenseTotal)}</strong>
          <p className="helper">Used in pie and category analysis.</p>
        </article>
        <article className="metric-card warning">
          <span className="muted">Investments analysed</span>
          <strong>{formatCurrency(investmentTotal)}</strong>
          <p className="helper">Included in total finance analysis.</p>
        </article>
      </div>

      <div className="analytics-grid">
        <article className="panel chart-panel">
          <div className="section-head">
            <h3 className="section-title">Expense pie chart</h3>
            <span className="helper">Category share</span>
          </div>
          <div className="section-visual-row compact-visual-row">
            <PieChartIllustration />
          </div>
          <PieChartCard data={expenseCategoryData} />
        </article>

        <article className="panel chart-panel">
          <div className="section-head">
            <h3 className="section-title">Income bar graph</h3>
            <span className="helper">Source totals</span>
          </div>
          <div className="section-visual-row compact-visual-row">
            <BarGrowthIllustration />
          </div>
          <BarChartCard data={incomeCategoryData} tone="income" />
        </article>
      </div>

      <article className="panel chart-panel">
        <div className="section-head">
          <h3 className="section-title">Monthly trend graph</h3>
          <span className="helper">Income vs expense</span>
        </div>
        <div className="section-visual-row compact-visual-row">
          <TrendSparkIllustration />
        </div>
        <TrendChartCard data={monthlyTrendData} />
      </article>
    </section>
  );
}

