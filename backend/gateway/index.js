import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";

import { getCurrentUser } from "./controller/user.controller.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { proxyWithHeaders } from "./utils/proxyWithHeader.js";

const port = process.env.PORT || 8000;
const configuredFrontendOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (
  process.env.NODE_ENV === "production" &&
  configuredFrontendOrigins.length === 0
) {
  throw new Error("FRONTEND_URL is not configured");
}

const frontendOrigins = configuredFrontendOrigins.length
  ? configuredFrontendOrigins
  : ["http://localhost:5173"];

const app = express();

app.use(morgan("dev"));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || frontendOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL));
app.use(
  "/api/chat",
  authMiddleware,
  proxyWithHeaders(process.env.CHAT_SERVICE_URL),
);
app.use("/api/agent", authMiddleware, proxy(process.env.AGENT_SERVICE_URL));

app.get("/api/me", authMiddleware, getCurrentUser);

app.listen(port, () => {
  console.log(`Gateway is running on port ${port}`);
});
