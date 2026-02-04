import { useEffect } from "react";
import { localDb } from "../db/localDb";
import { apiFetch } from "../api/client";

export const useSync = (budgetId: string | null) => {
  useEffect(() => {
    if (!budgetId) {
      return;
    }

    const sync = async () => {
      const pending = await localDb.transactions.where({ budgetId, status: "pending" }).toArray();
      for (const item of pending) {
        await apiFetch(`/api/budgets/${budgetId}/transactions`, {
          method: "POST",
          body: JSON.stringify(item.payload),
        });
        await localDb.transactions.update(item.id, { status: "synced" });
      }
    };

    const handleOnline = () => {
      sync();
    };

    window.addEventListener("online", handleOnline);
    if (navigator.onLine) {
      sync();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [budgetId]);
};
