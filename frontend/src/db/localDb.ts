import Dexie, { type Table } from "dexie";

export interface OfflineTransaction {
  id: string;
  budgetId: string;
  payload: Record<string, unknown>;
  status: "pending" | "synced";
  createdAt: string;
}

class FamilyBudgetDb extends Dexie {
  transactions!: Table<OfflineTransaction, string>;

  constructor() {
    super("FamilyBudgetDb");
    this.version(1).stores({
      transactions: "id, budgetId, status, createdAt",
    });
  }
}

export const localDb = new FamilyBudgetDb();
