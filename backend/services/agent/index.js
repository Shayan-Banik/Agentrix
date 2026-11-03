import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import router from "./routes/agent.route.js";

const port = process.env.PORT || 8000;

const app = express();

app.use(express.json());

app.use("/", router);

await connectDB();

app.listen(port, () => {
    console.log(`Agent started on port ${port}`);
});
