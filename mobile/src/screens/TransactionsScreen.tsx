import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import { apiFetch } from "../api/client";
import { localStore } from "../storage/localStore";
import { useActiveBudget } from "../hooks/useActiveBudget";

interface Transaction {
  id: string;
  description: string;
  amount_usd: string;
  date: string;
}

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const { budget, loading } = useActiveBudget();

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
      categoryId: "placeholder-category",
      amount: Number(amount),
      currency: "USD",
      account: "cash",
      type: "expense",
    };

    const isOnline = await localStore.get("online");
    if (!isOnline) {
      await localStore.queueTransaction(payload);
      return;
    }

    await apiFetch(`/api/budgets/${budget.id}/transactions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await load();
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Transactions</Text>
      {loading ? <Text>Loading budget...</Text> : null}
      {!loading && !budget?.id ? <Text>No active budget found.</Text> : null}
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <Button title="Add" onPress={handleAdd} />
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>
            {item.date} - {item.description} - {item.amount_usd}
          </Text>
        )}
      />
    </View>
  );
};

export default TransactionsScreen;
