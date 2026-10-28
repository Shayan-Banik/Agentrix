import { chatAgent } from "./chat.agent.js";

export const pptAgent = (state) =>
  chatAgent({
    ...state,
    prompt: `Create a complete presentation outline for this request: ${state.prompt}\nInclude a title, 5-12 slides, slide-purpose, and concise speaker notes. Do not claim that a PPT file was attached or generated.`,
  });