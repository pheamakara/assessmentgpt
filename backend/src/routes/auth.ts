import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { query } from "../db.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const { name, email, password } = parsed.data;
  const hashed = await bcrypt.hash(password, 12);

  try {
    const result = await query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashed]
    );

    return res.status(201).json({ userId: result.rows[0].id });
  } catch (error) {
    return res.status(400).json({ message: "Unable to register user" });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const { email, password } = parsed.data;
  const result = await query("SELECT id, password_hash FROM users WHERE email = $1", [email]);
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET ?? "", {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  });

  return res.json({ token });
});

router.post("/logout", (req, res) => {
  return res.status(200).json({ message: "Logged out" });
});

router.post("/refresh", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as { userId: string };
    const refreshed = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET ?? "", {
      expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
    });
    return res.json({ token: refreshed });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
