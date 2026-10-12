import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();

const app = express();

const port = process.env.PORT || 8000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Auth is running");
})


app.listen(port, () => {
    connectDB();
    console.log(`Auth started on port ${port}`);
});


