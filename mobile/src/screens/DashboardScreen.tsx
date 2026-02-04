import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { apiFetch } from "../api/client";
import { useActiveBudget } from "../hooks/useActiveBudget";

interface DashboardTotals {
  type: "income" | "expense";
  total: string;
}

const DashboardScreen = ({ navigation }: { navigation: { navigate: (route: string) => void } }) => {
  const [totals, setTotals] = useState<DashboardTotals[]>([]);
  const month = new Date().toISOString().slice(0, 7);
  const { budget, loading } = useActiveBudget();

  useEffect(() => {
    if (!budget?.id) {
      setTotals([]);
      return;
    }
    apiFetch<{ totals: DashboardTotals[] }>(
      `/api/budgets/${budget.id}/transactions/dashboard?month=${month}`
    )
      .then((response) => setTotals(response.totals))
      .catch(() => setTotals([]));
  }, [month, budget?.id]);

  const income = Number(totals.find((item) => item.type === "income")?.total ?? 0);
  const expense = Number(totals.find((item) => item.type === "expense")?.total ?? 0);

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Dashboard</Text>
      {loading ? <Text>Loading budget...</Text> : null}
      {!loading && !budget?.id ? <Text>No active budget found.</Text> : null}
      <Text>Month: {month}</Text>
      <Text>Income (USD): {income.toFixed(2)}</Text>
      <Text>Expenses (USD): {expense.toFixed(2)}</Text>
      <Text>Net (USD): {(income - expense).toFixed(2)}</Text>
      <Button title="Transactions" onPress={() => navigation.navigate("Transactions")} />
      <Button title="Settings" onPress={() => navigation.navigate("Settings")} />
    </View>
  );
};

export default DashboardScreen;
