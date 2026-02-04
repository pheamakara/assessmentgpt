import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { requireBudgetMember } from "../middleware/budgetAccess.js";

const router = Router({ mergeParams: true });

const categorySchema = z.object({
  name: z.string().min(1),
  monthlyLimit: z.number().positive().optional().nullable(),
});

router.get("/", requireAuth, requireBudgetMember, async (req: AuthRequest, res) => {
  const budgetId = req.params.id;
  const result = await query("SELECT * FROM categories WHERE budget_id = $1 ORDER BY name", [
    budgetId,
  ]);
  return res.json(result.rows);
});

router.post("/", requireAuth, requireBudgetMember, async (req: AuthRequest, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const budgetId = req.params.id;
  const result = await query(
    "INSERT INTO categories (budget_id, name, monthly_limit) VALUES ($1, $2, $3) RETURNING id",
    [budgetId, parsed.data.name, parsed.data.monthlyLimit ?? null]
  );

  return res.status(201).json({ id: result.rows[0].id });
});

export default router;
