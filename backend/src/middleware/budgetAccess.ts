import type { Response, NextFunction } from "express";
import { query } from "../db.js";
import type { AuthRequest } from "./auth.js";

export const requireBudgetMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const budgetId = req.params.id;
  const userId = req.auth?.userId;
  if (!budgetId || !userId) {
    return res.status(400).json({ message: "Missing budget context" });
  }

  const result = await query(
    "SELECT role FROM budget_users WHERE budget_id = $1 AND user_id = $2",
    [budgetId, userId]
  );

  if (!result.rows[0]) {
    return res.status(403).json({ message: "Not a budget member" });
  }

  req.auth = { ...req.auth, budgetId, role: result.rows[0].role };
  return next();
};
