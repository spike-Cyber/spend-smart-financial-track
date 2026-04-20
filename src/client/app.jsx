import React from "react";
import { createRoot } from "react-dom/client";
import { publicPages } from "./config";
import { SplashPage, LandingPage, AuthPage, ForgotPasswordPage, ResetPasswordPage } from "./public-pages";
import { AppShell } from "./components/AppShell";
import { TransactionModal } from "./components/TransactionModal";
import { useSpendSmartApp } from "./hooks/useSpendSmartApp";

function App() {
  const app = useSpendSmartApp();
  const isLoggedOut = !app.user;
  const goToLanding = () => app.setPage(publicPages.landing);
  const goToLogin = () => app.setPage(publicPages.login);
  const clearResetQuery = () => window.history.replaceState({}, "", window.location.pathname);

  if (isLoggedOut && app.page === publicPages.splash) {
    return <SplashPage onContinue={goToLanding} onSkip={goToLogin} />;
  }

  if (isLoggedOut && app.page === publicPages.landing) {
    return <LandingPage heroTotals={app.heroTotals} onLogin={goToLogin} onSignup={() => app.setPage(publicPages.signup)} />;
  }

  if (isLoggedOut && app.page === publicPages.login) {
    return (
      <AuthPage
        mode="login"
        feedback={app.authFeedback}
        onSubmit={app.handleAuthSubmit}
        onBack={goToLanding}
        onSwitch={() => { app.setAuthFeedback(""); app.setPage(publicPages.signup); }}
        onForgotPassword={() => { app.setPasswordResetFeedback(""); app.setPage(publicPages.forgotPassword); }}
      />
    );
  }

  if (isLoggedOut && app.page === publicPages.signup) {
    return (
      <AuthPage
        mode="signup"
        feedback={app.authFeedback}
        onSubmit={app.handleAuthSubmit}
        onBack={goToLanding}
        onSwitch={() => { app.setAuthFeedback(""); goToLogin(); }}
      />
    );
  }

  if (isLoggedOut && app.page === publicPages.forgotPassword) {
    return <ForgotPasswordPage feedback={app.passwordResetFeedback} onSubmit={app.handleForgotPasswordSubmit} onBack={goToLogin} />;
  }

  if (isLoggedOut && app.page === publicPages.resetPassword) {
    const params = new URLSearchParams(window.location.search);
    return (
      <ResetPasswordPage
        email={params.get("email")}
        token={params.get("resetToken")}
        feedback={app.passwordResetFeedback}
        onSubmit={app.handleResetPasswordSubmit}
        onBackToLogin={() => {
          clearResetQuery();
          goToLogin();
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
