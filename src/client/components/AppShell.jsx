import React from "react";
import { appPages } from "../config";
import { labelForPage } from "../utils";
import { AnalyticsPage } from "../analytics-page";
import { OverviewPage, FinanceSectionPage } from "../finance-pages";
import { SettingsPage } from "../settings-page";

export function AppShell({
  user,
  page,
  theme,
  compactMode,
  summary,
  transactions,
  expenseTransactions,
  incomeTransactions,
  investmentTransactions,
  expenseTotal,
  incomeTotal,
  investmentTotal,
  expenseCategoryData,
  incomeCategoryData,
  monthlyTrendData,
  onPageChange,
  onAddTransaction,
  onLogout,
  onDeleteTransaction,
  onEditTransaction,
  onThemeChange,
  onWorkspaceChange,
  onUserChange,
  onChangePassword
}) {
  return (
    <div className="app-shell">
      <header className="hero glass compact-hero">
        <div className="topbar">
          <div className="brand">
            <div className="logo-mark">S</div>
            <div>
              <p className="logo-name">Spend Smart</p>
              <p className="logo-sub">Smarter money moves, clearer decisions</p>
            </div>
          </div>
          <div className="nav-links">
            <button className="theme-button" onClick={() => onPageChange("settings")}>Themes</button>
            <button className="ghost-button" onClick={onAddTransaction}>Add transaction</button>
            <button className="ghost-button" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="main-grid">
        <aside className="sidebar glass">
          <div className="sidebar-brand">
            <div className="logo-mark">S</div>
            <div>
              <p className="logo-name">{user?.name || "Welcome"}</p>
              <p className="helper">{user?.email}</p>
            </div>
          </div>
          <div className="signal-card">
            <div className="signal-core">Rs</div>
            <div className="signal-ring signal-ring-one" />
            <div className="signal-ring signal-ring-two" />
            <div className="signal-dot signal-dot-one" />
            <div className="signal-dot signal-dot-two" />
            <p className="helper centered">Live finance signal</p>
          </div>
          <div className="sidebar-nav" style={{ marginTop: 20 }}>
            {appPages.map((key) => (
              <button key={key} className={page === key ? "active" : ""} onClick={() => onPageChange(key)}>
                {labelForPage(key)}
              </button>
            ))}
          </div>
        </aside>

        <main className="content-panel">
          {page === "overview" && (
            <OverviewPage
              user={user}
              summary={summary}
              transactions={transactions}
              expenseTotal={expenseTotal}
              incomeTotal={incomeTotal}
              investmentTotal={investmentTotal}
            />
          )}

          {page === "analytics" && (
            <AnalyticsPage
              transactions={transactions}
              expenseCategoryData={expenseCategoryData}
              incomeCategoryData={incomeCategoryData}
              monthlyTrendData={monthlyTrendData}
              expenseTotal={expenseTotal}
              incomeTotal={incomeTotal}
              investmentTotal={investmentTotal}
            />
          )}

          {page === "expenses" && (
            <FinanceSectionPage
              title="Expenses"
              eyebrow="Second part"
              helper="Add and review all expense data here."
              total={expenseTotal}
              items={expenseTransactions}
              emptyText="No expense entries yet."
              actionLabel="Add expense"
              onAdd={() => onEditTransaction({ type: "expense", category: "Food" })}
              onEdit={(item) => onEditTransaction({ type: item.type, category: item.category }, item)}
              onDelete={onDeleteTransaction}
            />
          )}

          {page === "income" && (
            <FinanceSectionPage
              title="Income"
              eyebrow="Third part"
              helper="Track salary, freelance work, and any other income here."
              total={incomeTotal}
              items={incomeTransactions}
              emptyText="No income entries yet."
              actionLabel="Add income"
              onAdd={() => onEditTransaction({ type: "income", category: "Salary" })}
              onEdit={(item) => onEditTransaction({ type: item.type, category: item.category }, item)}
              onDelete={onDeleteTransaction}
            />
          )}

          {page === "investments" && (
            <FinanceSectionPage
              title="Investment"
              eyebrow="Fourth part"
              helper="Use this section for investment-related entries and tracking."
              total={investmentTotal}
              items={investmentTransactions}
              emptyText="No investment entries yet."
              actionLabel="Add investment"
              onAdd={() => onEditTransaction({ type: "income", category: "Investments" })}
              onEdit={(item) => onEditTransaction({ type: item.type, category: item.category }, item)}
              onDelete={onDeleteTransaction}
            />
          )}

          {page === "settings" && (
            <SettingsPage
              user={user}
              theme={theme}
              compactMode={compactMode}
              onThemeChange={onThemeChange}
              onWorkspaceChange={onWorkspaceChange}
              onUserChange={onUserChange}
              onChangePassword={onChangePassword}
            />
          )}
        </main>
      </div>
    </div>
  );
}
