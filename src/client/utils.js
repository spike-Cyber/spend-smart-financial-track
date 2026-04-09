export function labelForPage(page) {
  const labels = {
    overview: "Overview",
    analytics: "Analytics",
    expenses: "Expenses",
    income: "Income",
    investments: "Investment",
    settings: "Settings"
  };
  return labels[page] || page;
}

export async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

export function downloadJson(fileName, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export function groupTotals(items, key) {
  return Object.entries(
    items.reduce((acc, item) => {
      const group = item[key] || "Other";
      acc[group] = (acc[group] || 0) + Number(item.amount || 0);
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildMonthlyTrend(items) {
  return Object.values(
    items.reduce((acc, item) => {
      const month = item.date?.slice(0, 7) || "Unknown";
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 };
      }
      acc[month][item.type] += Number(item.amount || 0);
      return acc;
    }, {})
  ).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
}




