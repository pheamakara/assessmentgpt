import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

interface Budget {
  id: string;
  name: string;
  base_currency: string;
  khr_rate: number;
}

export const useActiveBudget = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch<Budget | null>("/api/budgets/active")
      .then((response) => {
        if (mounted) {
          setBudget(response);
        }
      })
      .catch(() => {
        if (mounted) {
          setBudget(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { budget, loading };
};
