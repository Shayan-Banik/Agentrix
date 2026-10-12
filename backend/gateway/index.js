import express from "express";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import cors from "cors";
import proxy from "express-http-proxy";

const app = express();

const port = process.env.PORT || 8000;

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL));

app.get("/", (req, res) => {
    res.send("Gateway is running");
})


app.listen(port, () => {
    console.log(`Gateway is running on port ${port}`);
});


