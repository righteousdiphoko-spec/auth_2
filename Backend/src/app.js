import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { isProduction } from "./config/env.js";
import prisma from "./config/prisma.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  try {
    const { hostname } = new URL(origin);
    const configuredHost = new URL(env.FRONTEND_URL).hostname;

    return hostname === configuredHost ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".vercel.app") ||
      hostname.endsWith(".onrender.com");
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    callback(new Error("Origin not allowed"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
app.locals.prisma = prisma;

app.get("/", (req, res) => res.json({ success: true, name: "Auth2 API", health: "/health" }));
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ success: false, status: "db_error", message: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
