import { Router } from "express";
import { login, logout } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/logout", logout);

export default authRouter;
