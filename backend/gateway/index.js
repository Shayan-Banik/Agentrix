import express from "express";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import cors from "cors";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";

import { getCurrentUser } from "./controller/user.controller.js";
import { authMiddleware } from "./middleware/auth.middleware.js";

const port = process.env.PORT || 8000;

const app = express();

app.use(morgan("dev"));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL));
app.get("/api/me", authMiddleware, getCurrentUser);

app.listen(port, () => {
    console.log(`Gateway is running on port ${port}`);
});


