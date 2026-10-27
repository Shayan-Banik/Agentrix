import Router from "express";
import { createConversation, createMessages, deleteConversation, getConversations, getMessages, updateConversationTitle } from "../controllers/chat.controller.js";


const chatRouter = Router();

chatRouter.post("/create-conversations", createConversation);
chatRouter.get("/get-conversations", getConversations);
chatRouter.post("/create-messages", createMessages);
chatRouter.get("/get-messages/:conversationId", getMessages);
chatRouter.put("/update-conversation-title", updateConversationTitle);
chatRouter.delete("/delete-conversation/:conversationId", deleteConversation);

export default chatRouter;