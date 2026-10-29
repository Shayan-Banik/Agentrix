import { chatAgent } from "./chat.agent.js";
import { codingAgent } from "./coding.agent.js";
import { imageGenAgent } from "./imageGenerator.agent.js";
import { pdfAgent } from "./pdf.agent.js";
import { pptAgent } from "./ppt.agent.js";
import { searchAgent } from "./search.agent.js";

export const agentRegistry = {
  chat: {
    label: "Chat",
    description: "General conversation, explanations, learning, and questions.",
    handler: chatAgent,
    order: 1,
  },
  coding: {
    label: "Coding",
    description: "Code generation, debugging, reviews, and software development.",
    handler: codingAgent,
    order: 2,
    routePriority: 4,
    routePattern:
      /\b(fix|debug|write|implement|refactor|build|create|code)\b.*\b(code|function|component|api|app|script|class|react|javascript|typescript|python|sql)\b/i,
  },
  search: {
    label: "Search",
    description: "Web searches for current, recent, or time-sensitive information.",
    handler: searchAgent,
    order: 6,
    next: "chat",
    routePriority: 5,
    routePattern:
      /\b(current|latest|today|now|recent|news|weather|price|live|search|browse|find online|look up)\b/i,
  },
  pdf: {
    label: "PDF",
    description: "Create a structured document or PDF-ready content.",
    handler: pdfAgent,
    order: 3,
    routePriority: 3,
    routePattern:
      /\b(create|generate|make|build|convert|export)\b.*\b(pdf|document)\b/i,
  },
  ppt: {
    label: "PPT",
    description: "Create a presentation or slide outline.",
    handler: pptAgent,
    order: 4,
    routePriority: 2,
    routePattern:
      /\b(create|generate|make|build|convert|export)\b.*\b(ppt|powerpoint|presentation|slides)\b/i,
  },
  imageGen: {
    label: "Image Generator",
    description: "Create images from a written description.",
    handler: imageGenAgent,
    order: 5,
    aliases: ["image"],
    routePriority: 1,
    routePattern:
      /\b(create|generate|make|draw|edit)\b.*\b(image|picture|photo|logo|illustration|art)\b/i,
  },
};

export function resolveAgentId(mode) {
  return Object.entries(agentRegistry).find(
    ([id, agent]) => id === mode || agent.aliases?.includes(mode),
  )?.[0];
}

export function getAgentOptions() {
  return Object.entries(agentRegistry)
    .sort(([, first], [, second]) => (first.order ?? Infinity) - (second.order ?? Infinity))
    .map(([id, { label }]) => ({ id, label }));
}
