import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import budgetRoutes from "./routes/budgets.js";
import transactionRoutes from "./routes/transactions.js";
import settingsRoutes from "./routes/settings.js";
import categoryRoutes from "./routes/categories.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/budgets/:id/transactions", transactionRoutes);
app.use("/api/budgets/:id/categories", categoryRoutes);
app.use("/api/settings", settingsRoutes);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`Family Budget API running on :${port}`);
});
