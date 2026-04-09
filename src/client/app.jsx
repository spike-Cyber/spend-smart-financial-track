import React from "react";
import { createRoot } from "react-dom/client";
import { publicPages } from "./config";
import { SplashPage, LandingPage, AuthPage, ForgotPasswordPage, ResetPasswordPage } from "./public-pages";
import { AppShell } from "./components/AppShell";
import { TransactionModal } from "./components/TransactionModal";
import { useSpendSmartApp } from "./hooks/useSpendSmartApp";

function App() {
  const app = useSpendSmartApp();

  if (!app.user && app.page === publicPages.splash) {
    return <SplashPage onContinue={() => app.setPage(publicPages.landing)} onSkip={() => app.setPage(publicPages.login)} />;
  }

  if (!app.user && app.page === publicPages.landing) {
    return <LandingPage heroTotals={app.heroTotals} onLogin={() => app.setPage(publicPages.login)} onSignup={() => app.setPage(publicPages.signup)} />;
  }

  if (!app.user && app.page === publicPages.login) {
    return (
      <AuthPage
        mode="login"
        feedback={app.authFeedback}
        onSubmit={app.handleAuthSubmit}
        onBack={() => app.setPage(publicPages.landing)}
        onSwitch={() => { app.setAuthFeedback(""); app.setPage(publicPages.signup); }}
        onForgotPassword={() => { app.setPasswordResetFeedback(""); app.setPage(publicPages.forgotPassword); }}
      />
    );
  }

  if (!app.user && app.page === publicPages.signup) {
    return (
      <AuthPage
        mode="signup"
        feedback={app.authFeedback}
        onSubmit={app.handleAuthSubmit}
        onBack={() => app.setPage(publicPages.landing)}
        onSwitch={() => { app.setAuthFeedback(""); app.setPage(publicPages.login); }}
      />
    );
  }

  if (!app.user && app.page === publicPages.forgotPassword) {
    return <ForgotPasswordPage feedback={app.passwordResetFeedback} onSubmit={app.handleForgotPasswordSubmit} onBack={() => app.setPage(publicPages.login)} />;
  }

  if (!app.user && app.page === publicPages.resetPassword) {
    const params = new URLSearchParams(window.location.search);
    return (
      <ResetPasswordPage
        email={params.get("email")}
        token={params.get("resetToken")}
        feedback={app.passwordResetFeedback}
        onSubmit={app.handleResetPasswordSubmit}
        onBackToLogin={() => {
          window.history.replaceState({}, "", window.location.pathname);
          app.setPage(publicPages.login);
        }}
      />
    );
  }

  return (
    <>
      <AppShell
        user={app.user}
        page={app.page}
        theme={app.theme}
        compactMode={app.compactMode}
        summary={app.summary}
        transactions={app.transactions}
        expenseTransactions={app.expenseTransactions}
        incomeTransactions={app.incomeTransactions}
        investmentTransactions={app.investmentTransactions}
        expenseTotal={app.expenseTotal}
        incomeTotal={app.incomeTotal}
        investmentTotal={app.investmentTotal}
        expenseCategoryData={app.expenseCategoryData}
        incomeCategoryData={app.incomeCategoryData}
        monthlyTrendData={app.monthlyTrendData}
        onPageChange={app.setPage}
        onAddTransaction={() => app.openTransactionModal({ type: "income", category: "Salary" })}
        onLogout={app.logout}
        onDeleteTransaction={app.removeTransaction}
        onEditTransaction={app.openTransactionModal}
        onThemeChange={app.applyTheme}
        onWorkspaceChange={app.applyWorkspacePreferences}
        onUserChange={app.setUser}
        onChangePassword={app.handleChangePassword}
      />

      {app.showTransaction && (
        <TransactionModal
          editingTransaction={app.editingTransaction}
          transactionPreset={app.transactionPreset}
          transactionFeedback={app.transactionFeedback}
          onClose={app.closeTransactionModal}
          onSubmit={app.handleTransactionSubmit}
        />
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
