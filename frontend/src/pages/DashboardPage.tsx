import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSync } from "../hooks/useSync";
import { apiFetch } from "../api/client";
import { useActiveBudget } from "../hooks/useActiveBudget";

interface DashboardTotals {
  type: "income" | "expense";
  total: string;
}

const DashboardPage = () => {
  const { budget, loading } = useActiveBudget();
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [month] = useState(() => new Date().toISOString().slice(0, 7));
  const [totals, setTotals] = useState<DashboardTotals[]>([]);

  useEffect(() => {
    if (budget?.id) {
      setBudgetId(budget.id);
    }
  }, [budget]);

  useSync(budgetId);

  useEffect(() => {
    if (!budgetId) {
      return;
    }
    apiFetch<{ totals: DashboardTotals[] }>(`/api/budgets/${budgetId}/transactions/dashboard?month=${month}`)
      .then((response) => setTotals(response.totals))
      .catch(() => setTotals([]));
  }, [budgetId, month]);

  const income = Number(totals.find((item) => item.type === "income")?.total ?? 0);
  const expense = Number(totals.find((item) => item.type === "expense")?.total ?? 0);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", gap: 16 }}>
        <h2>Dashboard</h2>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link to="/transactions">Transactions</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <section>
        {loading ? <p>Loading budget...</p> : null}
        {!loading && !budgetId ? (
          <p>No active budget yet. Create or join one to see your dashboard.</p>
        ) : null}
        <p>Month: {month}</p>
        <div style={{ display: "flex", gap: 16 }}>
          <div>Income (USD): {income.toFixed(2)}</div>
          <div>Expenses (USD): {expense.toFixed(2)}</div>
          <div>Net (USD): {(income - expense).toFixed(2)}</div>
        </div>
      </section>
      <section>
        <h3>Offline sync</h3>
        <p>Transactions added offline will sync automatically when you reconnect.</p>
      </section>
    </div>
  );
};

export default DashboardPage;
