import "dotenv/config";
import express from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import cors from "cors";
import path from "path";
import { pool } from "./db";
import authRouter from "./routes/auth";
import membersRouter from "./routes/members";
import announcementsRouter from "./routes/announcements";
import leadersRouter from "./routes/leaders";
import welfareRouter from "./routes/welfare";
import paymentsRouter from "./routes/payments";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PgSession = ConnectPgSimple(session);
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET is required in production.");
}
app.use(
  session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: sessionSecret || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use("/api/auth", authRouter);
app.use("/api/members", membersRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/leaders", leadersRouter);
app.use("/api/welfare", welfareRouter);
app.use("/api/payments", paymentsRouter);

app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!err) return next();
  console.error(err);

  if (req.path.startsWith("/api")) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Internal Server Error",
    });
  }

  return next(err);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "dist")));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(process.cwd(), "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`KUWESA server running on port ${PORT}`);
});

export default app;
