import React from "react";
import { MonthlyWaveIllustration, OverviewIllustration, ReceiptIllustration, SectionIllustration } from "./visuals";
import { formatCurrency, formatDate } from "./utils";
export function OverviewPage({ user, summary, transactions, expenseTotal, incomeTotal, investmentTotal }) {
  if (!user || !summary) {
    return <div className="panel"><div className="empty-state">Sign in to unlock your complete financial overview.</div></div>;
  }

  const latest = transactions.slice(0, 5);
  const maxMonthly = Math.max(...summary.monthly.map((item) => Math.max(item.income, item.expense)), 1);

  return (
    <>
      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">First part</p>
            <h2 className="page-title">Available balance and complete overview</h2>
            <p className="helper">A complete snapshot of your balance, income, expenses, investments, and recent activity.</p>
          </div>
          <OverviewIllustration />
        </div>
        <div className="stat-grid">
          <article className="metric-card success">
            <span className="muted">Available balance</span>
            <strong>{formatCurrency(summary.totals.balance)}</strong>
            <p className="helper">See how much financial room you have right now.</p>
          </article>
          <article className="metric-card">
            <span className="muted">Total income</span>
            <strong>{formatCurrency(incomeTotal)}</strong>
            <p className="helper">Every earning source, pulled into one clear number.</p>
          </article>
          <article className="metric-card danger">
            <span className="muted">Total expenses</span>
            <strong>{formatCurrency(expenseTotal)}</strong>
            <p className="helper">A fast read on how much has gone out.</p>
          </article>
          <article className="metric-card warning">
            <span className="muted">Investment value tracked</span>
            <strong>{formatCurrency(investmentTotal)}</strong>
            <p className="helper">Monitor how much you are allocating toward growth.</p>
          </article>
        </div>
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="section-head">
            <h3 className="section-title">Monthly overview</h3>
            <span className="helper">Your financial rhythm over time</span>
          </div>
          <div className="section-visual-row compact-visual-row">
            <MonthlyWaveIllustration />
          </div>
          {summary.monthly.length ? (
            <div className="bars-grid">
              {summary.monthly.map((item) => (
                <div className="bar-column" key={item.month}>
                  <div className="dual-bars">
                    <span className="bar-income" style={{ height: `${Math.max((item.income / maxMonthly) * 160, item.income ? 18 : 6)}px` }} />
                    <span className="bar-expense" style={{ height: `${Math.max((item.expense / maxMonthly) * 160, item.expense ? 18 : 6)}px` }} />
                  </div>
                  <span className="helper">{item.month.slice(5).replace("-", "/")}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state">Add transactions to unlock monthly overview.</div>}
        </div>

        <div className="panel">
          <div className="section-head">
            <h3 className="section-title">Recent full data</h3>
            <span className="helper">Latest entries</span>
          </div>
          <div className="section-visual-row compact-visual-row">
            <ReceiptIllustration />
          </div>
          {latest.length ? (
            <div className="transactions-list">
              {latest.map((item) => (
                <article className="transaction-row" key={item.id}>
                  <div>
                    <p className="transaction-title">{item.title}</p>
                    <p className="helper">{item.category} • {formatDate(item.date)}</p>
                  </div>
                  <div className={`amount ${item.type}`}>{item.type === "expense" ? "-" : "+"}{formatCurrency(item.amount)}</div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state">No data yet.</div>}
        </div>
      </section>
    </>
  );
}

export function FinanceSectionPage({ title, eyebrow, helper, total, items, emptyText, actionLabel, onAdd, onEdit, onDelete }) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="page-title">{title}</h2>
          <p className="helper">{helper}</p>
        </div>
        <button className="primary-button" onClick={onAdd}>{actionLabel}</button>
      </div>

      <div className="section-visual-row">
        <SectionIllustration title={title} />
      </div>

      <div className="stat-grid">
        <article className="metric-card success">
          <span className="muted">Total {title.toLowerCase()}</span>
          <strong>{formatCurrency(total)}</strong>
          <p className="helper">A live total that updates with every new record.</p>
        </article>
        <article className="metric-card">
          <span className="muted">Records</span>
          <strong>{items.length}</strong>
          <p className="helper">Every entry that powers this section's analysis.</p>
        </article>
      </div>

      {!items.length ? (
        <div className="empty-state">{emptyText}</div>
      ) : (
        <div className="transactions-list">
          {items.map((transaction) => (
            <article className="transaction-row" key={transaction.id}>
              <div>
                <p className="transaction-title">{transaction.title}</p>
                <p className="helper">{transaction.category} • {formatDate(transaction.date)}{transaction.notes ? ` • ${transaction.notes}` : ""}</p>
              </div>
              <div className={`amount ${transaction.type}`}>{transaction.type === "expense" ? "-" : "+"}{formatCurrency(transaction.amount)}</div>
              <div className="transaction-actions">
                <button className="ghost-button" onClick={() => onEdit(transaction)}>Edit</button>
                <button className="danger-button" onClick={() => onDelete(transaction.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

