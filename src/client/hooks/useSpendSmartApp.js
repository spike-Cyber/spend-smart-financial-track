import { useEffect, useMemo, useState } from "react";
import { demoMonthly, publicPages } from "../config";
import { api, buildMonthlyTrend, groupTotals } from "../utils";

export function useSpendSmartApp() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(publicPages.splash);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [compactMode, setCompactMode] = useState(localStorage.getItem("settings_compact") === "on");
  const [authFeedback, setAuthFeedback] = useState("");
  const [passwordResetFeedback, setPasswordResetFeedback] = useState("");
  const [transactionFeedback, setTransactionFeedback] = useState("");
  const [showTransaction, setShowTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionPreset, setTransactionPreset] = useState({ type: "income", category: "Salary" });

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.dataset.density = compactMode ? "compact" : "comfortable";
    localStorage.setItem("settings_compact", compactMode ? "on" : "off");
  }, [compactMode]);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resetToken") && params.get("email") && !user) {
      setPage(publicPages.resetPassword);
    }
  }, [user]);

  useEffect(() => {
    if (user || page !== publicPages.splash) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPage(publicPages.landing);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [page, user]);

  async function loadSession() {
    const response = await api("/api/auth/me");
    if (response.user) {
      setUser(response.user);
      setTheme(response.user.theme || theme);
      setCompactMode(response.user.compactMode === true);
      await loadDashboard();
      setPage("overview");
      return;
    }

    setPage(publicPages.splash);
  }

  async function loadDashboard() {
    const [summaryResponse, transactionsResponse] = await Promise.all([
      api("/api/summary"),
      api("/api/transactions")
    ]);
    setSummary(summaryResponse);
    setTransactions(transactionsResponse.transactions);
  }

  async function handleAuthSubmit(event, mode) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";

    try {
      const response = await api(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setUser(response.user);
      setTheme(response.user.theme || "light");
      setCompactMode(response.user.compactMode === true);
      setAuthFeedback("");
      await loadDashboard();
      setPage("overview");
    } catch (error) {
      setAuthFeedback(error.message);
    }
  }

  async function handleTransactionSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const id = payload.id;
    delete payload.id;

    try {
      await api(id ? `/api/transactions/${id}` : "/api/transactions", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      closeTransactionModal();
      setTransactionFeedback("");
      await loadDashboard();
    } catch (error) {
      setTransactionFeedback(error.message);
    }
  }

  async function removeTransaction(id) {
    await api(`/api/transactions/${id}`, { method: "DELETE" });
    await loadDashboard();
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
    setSummary(null);
    setTransactions([]);
    setPage(publicPages.landing);
  }

  async function applyTheme(nextTheme) {
    setTheme(nextTheme);
    if (!user) return;

    const response = await api("/api/preferences/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: nextTheme })
    });
    setUser(response.user);
  }

  async function applyWorkspacePreferences(patch) {
    if (!user) return;

    const response = await api("/api/preferences/workspace", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weeklyDigest: patch.weeklyDigest !== undefined ? patch.weeklyDigest : user.weeklyDigest === true,
        compactMode: patch.compactMode !== undefined ? patch.compactMode : compactMode
      })
    });

    setUser(response.user);
    setCompactMode(response.user.compactMode === true);
  }

  async function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    try {
      const response = await api("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (response.resetLink) {
        const resetUrl = new URL(response.resetLink, window.location.origin);
        window.history.replaceState({}, "", `${window.location.pathname}${resetUrl.search}`);
        setPasswordResetFeedback("Reset link prepared. Set your new password below.");
        setPage(publicPages.resetPassword);
        return;
      }

      setPasswordResetFeedback(response.message);
    } catch (error) {
      setPasswordResetFeedback(error.message);
    }
  }

  async function handleResetPasswordSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await api("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setPasswordResetFeedback(response.message);
      window.history.replaceState({}, "", window.location.pathname);
      setPage(publicPages.login);
    } catch (error) {
      setPasswordResetFeedback(error.message);
    }
  }

  async function handleChangePassword({ currentPassword, newPassword }) {
    const response = await api("/api/auth/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return response.message;
  }

  function openTransactionModal(preset = { type: "income", category: "Salary" }, existing = null) {
    setEditingTransaction(existing);
    setTransactionPreset(preset);
    setTransactionFeedback("");
    setShowTransaction(true);
  }

  function closeTransactionModal() {
    setShowTransaction(false);
    setEditingTransaction(null);
  }

  const heroTotals = useMemo(() => {
    const income = demoMonthly.reduce((sum, item) => sum + item.income, 0);
    const expense = demoMonthly.reduce((sum, item) => sum + item.expense, 0);
    return { income, expense, balance: income - expense };
  }, []);

  const expenseTransactions = useMemo(() => transactions.filter((item) => item.type === "expense"), [transactions]);
  const incomeTransactions = useMemo(() => transactions.filter((item) => item.type === "income"), [transactions]);
  const investmentTransactions = useMemo(
    () => transactions.filter((item) => item.category === "Investments" || item.category === "Investment"),
    [transactions]
  );

  const expenseTotal = useMemo(() => expenseTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0), [expenseTransactions]);
  const incomeTotal = useMemo(() => incomeTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0), [incomeTransactions]);
  const investmentTotal = useMemo(() => investmentTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0), [investmentTransactions]);
  const expenseCategoryData = useMemo(() => groupTotals(expenseTransactions, "category"), [expenseTransactions]);
  const incomeCategoryData = useMemo(() => groupTotals(incomeTransactions, "category"), [incomeTransactions]);
  const monthlyTrendData = useMemo(() => buildMonthlyTrend(transactions), [transactions]);

  return {
    user,
    summary,
    transactions,
    page,
    theme,
    compactMode,
    authFeedback,
    passwordResetFeedback,
    transactionFeedback,
    showTransaction,
    editingTransaction,
    transactionPreset,
    heroTotals,
    expenseTransactions,
    incomeTransactions,
    investmentTransactions,
    expenseTotal,
    incomeTotal,
    investmentTotal,
    expenseCategoryData,
    incomeCategoryData,
    monthlyTrendData,
    setUser,
    setPage,
    setAuthFeedback,
    setPasswordResetFeedback,
    handleAuthSubmit,
    handleForgotPasswordSubmit,
    handleResetPasswordSubmit,
    handleChangePassword,
    handleTransactionSubmit,
    removeTransaction,
    logout,
    applyTheme,
    applyWorkspacePreferences,
    openTransactionModal,
    closeTransactionModal
  };
}
