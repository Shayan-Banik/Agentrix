import Router from "express";
import { agent, listAgents } from "../controllers/agent.controller.js";

const router = Router();

router.get("/agents", listAgents);
router.post("/chat", agent);

export default router;