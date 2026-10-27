import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chatRouter from "./routes/chat.routes.js";
dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

app.use(express.json());

app.use("/", chatRouter);

await connectDB();

app.listen(port, () => {
    console.log(`Chat started on port ${port}`);
});

