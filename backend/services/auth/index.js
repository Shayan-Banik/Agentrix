import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.router.js";

const port = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter)

await connectDB();

app.listen(port, () => {
    console.log(`Auth started on port ${port}`);
});
