import redis from "../../../shared/redis/redis.js";
import { getMessages } from "../utils/getMessages.js";

export const getMemory = async (conversationId) => {
  const key = `messages-${conversationId}`;
  const cachedMemory = await redis.get(key);

  if (cachedMemory) {
    return JSON.parse(cachedMemory);
  }

  const message = await getMessages(conversationId);

  if (Array.isArray(message)) {
    await redis.set(key, JSON.stringify(message), "EX", 60 * 60 * 24 * 7);
    return message;
  }

  return [];
};

export const addMessages = async ( conversationId, role, content) => {
  const key = `messages-${conversationId}`;
  const rawMessages = await redis.get(key);
  const messages = rawMessages ? JSON.parse(rawMessages) : [];

  messages.push({
    role,
    content,
  });

  if(messages.length > 30){
    messages.shift();
  }

  await redis.set(key, JSON.stringify(messages), "EX", 60 * 60 * 24 * 7);

};
