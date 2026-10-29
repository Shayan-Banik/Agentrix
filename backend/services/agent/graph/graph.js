import { StateGraph } from "@langchain/langgraph";

import { router } from "./router.agent.js";
import { agentState } from "./state.js";
import { agentRegistry } from "../agents/registry.js";

const workflow = new StateGraph(agentState);

workflow.addNode("router", router);

for (const [agentId, { handler }] of Object.entries(agentRegistry)) {
  workflow.addNode(agentId, handler);
}

workflow.addEdge("__start__", "router");
workflow.addConditionalEdges(
  "router",
  (state) => (agentRegistry[state.agent] ? state.agent : "chat"),
  Object.fromEntries(
    Object.keys(agentRegistry).map((agentId) => [agentId, agentId]),
  ),
);

for (const [agentId, { next }] of Object.entries(agentRegistry)) {
  workflow.addEdge(agentId, next || "__end__");
}

export const graph = workflow.compile();
