import { useEffect, useState } from "react";
import { FiCpu } from "react-icons/fi";
import { getAvailableAgents } from "../features/agent.js";

export const AUTO_AGENT = { id: "auto", label: "Auto" };

export default function useAgentCatalog() {
  const [agents, setAgents] = useState([AUTO_AGENT]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    getAvailableAgents({ signal: controller.signal })
      .then(({ data }) => {
        if (!Array.isArray(data?.agents)) {
          throw new Error("The server returned an invalid agent catalog.");
        }

        const availableAgents = data.agents.filter(
          (agent) =>
            typeof agent?.id === "string" &&
            typeof agent?.label === "string" &&
            agent.id !== AUTO_AGENT.id,
        );
        setAgents([
          AUTO_AGENT,
          ...availableAgents.map((agent) => ({ ...agent, icon: FiCpu })),
        ]);
      })
      .catch((catalogError) => {
        if (!controller.signal.aborted) {
          console.error("Unable to load available agents:", catalogError);
          setError(
            "Could not load the agent list. Automatic routing is still available.",
          );
        }
      });

    return () => controller.abort();
  }, []);

  return { agents, error };
}
