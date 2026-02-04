import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { apiFetch } from "../api/client";
import { localDb } from "../db/localDb";
import { useActiveBudget } from "../hooks/useActiveBudget";

interface Transaction {
  id: string;
  description: string;
  amount_usd: string;
  date: string;
}

const TransactionsPage = () => {
  const { budget, loading } = useActiveBudget();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");

  const load = async () => {
    if (!budget?.id) {
      setTransactions([]);
      return;
    }
    const data = await apiFetch<Transaction[]>(`/api/budgets/${budget.id}/transactions`);
    setTransactions(data);
  };

  useEffect(() => {
    load().catch(() => setTransactions([]));
  }, [budget?.id]);

  const handleAdd = async () => {
    if (!budget?.id) {
      return;
    }

    const payload = {
      date: new Date().toISOString().slice(0, 10),
      description,
      categoryId: uuidv4(),
      amount,
      currency,
      account: "cash",
      type: "expense",
    };

    if (!navigator.onLine) {
      await localDb.transactions.add({
        id: uuidv4(),
        budgetId: budget.id,
        payload,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      setDescription("");
      setAmount(0);
      return;
    }

    await apiFetch(`/api/budgets/${budget.id}/transactions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await load();
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", gap: 16 }}>
        <h2>Transactions</h2>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link to="/">Dashboard</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <section style={{ marginTop: 16 }}>
        {loading ? <p>Loading budget...</p> : null}
        {!loading && !budget?.id ? <p>No active budget found.</p> : null}
        <input
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <input
          type="number"
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value))}
        />
        <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
          <option value="USD">USD</option>
          <option value="KHR">KHR</option>
        </select>
        <button type="button" onClick={handleAdd}>
          Add
        </button>
      </section>
      <ul>
        {transactions.map((item) => (
          <li key={item.id}>
            {item.date} - {item.description} - ${item.amount_usd}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionsPage;
