import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const budgetSchema = z.object({
  name: z.string().min(1),
  baseCurrency: z.literal("USD"),
  khrRate: z.number().positive(),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = budgetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const { name, baseCurrency, khrRate } = parsed.data;
  const inviteCode = uuidv4().slice(0, 8).toUpperCase();

  const result = await query(
    "INSERT INTO budgets (name, base_currency, invite_code, khr_rate) VALUES ($1, $2, $3, $4) RETURNING id",
    [name, baseCurrency, inviteCode, khrRate]
  );

  await query(
    "INSERT INTO budget_users (budget_id, user_id, role) VALUES ($1, $2, $3)",
    [result.rows[0].id, req.auth?.userId, "owner"]
  );

  return res.status(201).json({ id: result.rows[0].id, inviteCode });
});

router.get("/active", requireAuth, async (req: AuthRequest, res) => {
  const result = await query(
    "SELECT budgets.* FROM budgets JOIN budget_users ON budgets.id = budget_users.budget_id WHERE budget_users.user_id = $1 ORDER BY budget_users.joined_at DESC LIMIT 1",
    [req.auth?.userId]
  );

  if (!result.rows[0]) {
    return res.json(null);
  }

  return res.json(result.rows[0]);
});

router.post("/join", requireAuth, async (req: AuthRequest, res) => {
  const parsed = z.object({ inviteCode: z.string().min(4) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const budgetResult = await query("SELECT id FROM budgets WHERE invite_code = $1", [
    parsed.data.inviteCode,
  ]);
  if (!budgetResult.rows[0]) {
    return res.status(404).json({ message: "Invite code not found" });
  }

  await query(
    "INSERT INTO budget_users (budget_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
    [budgetResult.rows[0].id, req.auth?.userId, "member"]
  );

  return res.json({ budgetId: budgetResult.rows[0].id });
});

router.post("/:id/invite", requireAuth, async (req: AuthRequest, res) => {
  const membership = await query(
    "SELECT role FROM budget_users WHERE budget_id = $1 AND user_id = $2",
    [req.params.id, req.auth?.userId]
  );
  if (membership.rows[0]?.role !== "owner") {
    return res.status(403).json({ message: "Only owners can regenerate invite codes" });
  }

  const inviteCode = uuidv4().slice(0, 8).toUpperCase();
  await query("UPDATE budgets SET invite_code = $1 WHERE id = $2", [inviteCode, req.params.id]);
  return res.json({ inviteCode });
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const result = await query("SELECT * FROM budgets WHERE id = $1", [req.params.id]);
  if (!result.rows[0]) {
    return res.status(404).json({ message: "Budget not found" });
  }
  return res.json(result.rows[0]);
});

router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = z.object({ name: z.string().min(1), khrRate: z.number().positive() }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const membership = await query(
    "SELECT role FROM budget_users WHERE budget_id = $1 AND user_id = $2",
    [req.params.id, req.auth?.userId]
  );
  if (membership.rows[0]?.role !== "owner") {
    return res.status(403).json({ message: "Only owners can update budgets" });
  }

  await query("UPDATE budgets SET name = $1, khr_rate = $2 WHERE id = $3", [
    parsed.data.name,
    parsed.data.khrRate,
    req.params.id,
  ]);

  return res.json({ message: "Budget updated" });
});

export default router;
