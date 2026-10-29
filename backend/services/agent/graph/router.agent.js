import { getModel } from "../config/LLMmodels.js";
import { agentRegistry, resolveAgentId } from "../agents/registry.js";

function inferExplicitRoute(prompt) {
  const text = prompt.toLowerCase();
  return Object.entries(agentRegistry)
    .filter(([, agent]) => agent.routePattern?.test(text))
    .sort(
      ([, first], [, second]) =>
        (first.routePriority ?? Infinity) - (second.routePriority ?? Infinity),
    )[0]?.[0];
}

export const router = async (state) => {
  if (state.agentMode && state.agentMode !== "auto") {
    return {
      ...state,
      agent: resolveAgentId(state.agentMode) || "chat",
    };
  }

  const explicitRoute = inferExplicitRoute(state.prompt);
  if (explicitRoute) {
    return { ...state, agent: explicitRoute };
  }

  const llm = await getModel("router");
  const agentDescriptions = Object.entries(agentRegistry)
    .map(([id, agent]) => `- ${id}: ${agent.description}`)
    .join("\n");
  const prompt = `
        You are an agent router.
        Available agents:
${agentDescriptions}

        Return only one available agent ID.

        User Query:
        ${state.prompt}

    `;

  try {
    const response = await llm.invoke(prompt);
    const routedMode = String(response.content || "")
      .trim()
      .toLowerCase()
      .match(/[a-z][a-z0-9_-]*/)?.[0];
    return {
      ...state,
      agent: resolveAgentId(routedMode) || "chat",
    };
  } catch (error) {
    console.error("Agent routing failed:", error);
    return { ...state, agent: "chat" };
  }
};