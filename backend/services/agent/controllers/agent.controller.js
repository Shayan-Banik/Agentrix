import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessages } from "../config/memory.js";
import redis from "../../../shared/redis/redis.js";

const AGENT_MODES = new Set(["auto", "chat", "coding", "search", "pdf", "ppt", "image"]);

export const agent = async (req, res) => {
  try {
    const {
      prompt,
      conversationId,
      saveUserMessage = true,
      agentMode = "auto",
      timezone,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    if (!AGENT_MODES.has(agentMode)) {
      return res.status(400).json({ message: "Unsupported agent mode" });
    }

    await redis.del(`messages-${conversationId}`);

    if (saveUserMessage) {
      await axios.post(`${process.env.CHAT_SERVICE}/create-messages`, {
        conversationId,
        role: "user",
        content: prompt,
      });
    }

    const result = await graph.invoke({
      prompt: prompt,
      conversationId: conversationId,
      agentMode,
      timezone,
    });

    const response = result.aiResponse;
    const images = (Array.isArray(result.images) ? result.images : [])
      .map((image) =>
        typeof image === "string"
          ? { url: image }
          : { url: image?.url, title: image?.title },
      )
      .filter((image) => /^https?:\/\//i.test(image.url || ""));

    await addMessages(conversationId, "user", prompt);
    await addMessages(conversationId, "assistant", response);
    if(saveUserMessage){
      await axios.post(`${process.env.CHAT_SERVICE}/create-messages`, {
        conversationId,
        role: "assistant",
        content: response,
        images,
        artifacts: result.artifacts,
      });
    }
    return res.status(200).json({
      content: response,
      agent: result.agent,
      images,
      artifacts: result.artifacts,
    });
  } catch (error) {
    const status = error?.status || error?.statusCode || error?.response?.status;
    const insufficientBalance =
      status === 402 || /insufficient balance/i.test(String(error?.message || error));
    const message = insufficientBalance
      ? "The active AI provider has insufficient balance. Please add credits or configure another provider."
      : `agent error ${error?.message || error}`;
    return res.status(insufficientBalance ? 502 : 500).json({ message });
  }
};
