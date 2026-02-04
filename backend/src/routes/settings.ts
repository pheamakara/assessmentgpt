import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const result = await query("SELECT * FROM user_settings WHERE user_id = $1", [req.auth?.userId]);
  return res.json(result.rows[0] ?? null);
});

router.put("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = z
    .object({
      defaultCurrency: z.enum(["USD", "KHR"]),
      monthStartDay: z.number().min(1).max(28),
      decimalPrecision: z.enum([0, 2]),
      theme: z.enum(["light", "dark", "system"]),
      language: z.enum(["en", "km"]),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  await query(
    "INSERT INTO user_settings (user_id, default_currency, month_start_day, decimal_precision, theme, language) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (user_id) DO UPDATE SET default_currency = EXCLUDED.default_currency, month_start_day = EXCLUDED.month_start_day, decimal_precision = EXCLUDED.decimal_precision, theme = EXCLUDED.theme, language = EXCLUDED.language",
    [
      req.auth?.userId,
      parsed.data.defaultCurrency,
      parsed.data.monthStartDay,
      parsed.data.decimalPrecision,
      parsed.data.theme,
      parsed.data.language,
    ]
  );

  return res.json({ message: "Settings updated" });
});

export default router;
