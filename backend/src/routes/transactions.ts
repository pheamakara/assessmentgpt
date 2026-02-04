import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { requireBudgetMember } from "../middleware/budgetAccess.js";

const router = Router({ mergeParams: true });

const transactionSchema = z.object({
  date: z.string(),
  description: z.string().min(1),
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(["USD", "KHR"]),
  account: z.enum(["cash", "bank", "wallet"]),
  type: z.enum(["income", "expense"]),
});

router.post("/", requireAuth, requireBudgetMember, async (req: AuthRequest, res) => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const { date, description, categoryId, amount, currency, account, type } = parsed.data;
  const budgetId = req.params.id;
  const rateResult = await query("SELECT khr_rate FROM budgets WHERE id = $1", [budgetId]);
  const khrRate = rateResult.rows[0]?.khr_rate ?? 4100;
  const amountUsd = currency === "USD" ? amount : amount / khrRate;

  const result = await query(
    "INSERT INTO transactions (budget_id, category_id, date, description, amount, currency, amount_usd, account, type, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id",
    [budgetId, categoryId, date, description, amount, currency, amountUsd, account, type, req.auth?.userId]
  );

  return res.status(201).json({ id: result.rows[0].id });
});

router.get("/", requireAuth, requireBudgetMember, async (req: AuthRequest, res) => {
  const budgetId = req.params.id;
  const result = await query(
    "SELECT * FROM transactions WHERE budget_id = $1 ORDER BY date DESC",
    [budgetId]
  );
  return res.json(result.rows);
});

router.get("/dashboard", requireAuth, requireBudgetMember, async (req: AuthRequest, res) => {
  const budgetId = req.params.id;
  const month = req.query.month as string;
  const result = await query(
    "SELECT type, SUM(amount_usd) as total FROM transactions WHERE budget_id = $1 AND to_char(date, 'YYYY-MM') = $2 GROUP BY type",
    [budgetId, month]
  );

  return res.json({ month, totals: result.rows });
});

export default router;
