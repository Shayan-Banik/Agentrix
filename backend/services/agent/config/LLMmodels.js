import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatOpenRouter } from "@langchain/openrouter";
import "dotenv/config";

const groq = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
});

const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-3.8-flash",
  temperature: 0,
  maxRetries: 2,
});

// const deepSeek = new ChatDeepSeek({
//   model: "deepseek-reasoner",
//   temperature: 0,
//   maxTokens: 2500,
// });

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return groq;
    case "coding":
      return groq;
    case "imageGen":
      return gemini;
    default:
      return groq;
  }
};
