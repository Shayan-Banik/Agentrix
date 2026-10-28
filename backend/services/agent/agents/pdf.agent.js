import { chatAgent } from "./chat.agent.js";

export const pdfAgent = (state) =>
  chatAgent({
    ...state,
    prompt: `Create a complete, well-structured document for this request: ${state.prompt}\nDo not claim that a PDF file was attached or generated.`,
  });