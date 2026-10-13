import { Router } from "express";
import { login } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", login);

export default authRouter;