import { chatAgent } from "./chat.agent.js";

export const imageGenAgent = (state) =>
  chatAgent({
    ...state,
    prompt: `Improve this image-generation request for an image model while preserving all details: ${state.prompt}\nRespond with a polished prompt and a short list of alternatives. Do not claim that an image was generated.`,
  });