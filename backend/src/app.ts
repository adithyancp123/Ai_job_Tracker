import cors from "cors";
import express from "express";

import authController from "./controllers/auth.controller";
import authMiddleware from "./middleware/auth.middleware";
import errorHandler from "./middleware/errorHandler";
import aiRoutes from "./routes/ai.routes";
import authRoutes from "./routes/auth.routes";
import healthRouter from "./routes/healthRoutes";
import jobApplicationRoutes from "./routes/jobApplication.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API is running" });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRoutes);
app.use("/api/applications", jobApplicationRoutes);
app.use("/api/ai", aiRoutes);
app.get("/api/protected", authMiddleware, authController.getProtected);
app.use(errorHandler);

export default app;
