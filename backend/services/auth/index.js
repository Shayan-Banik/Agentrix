import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.router.js";
dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

app.use(express.json());

app.use("/", authRouter)


app.listen(port, () => {
    connectDB();
    console.log(`Auth started on port ${port}`);
});


