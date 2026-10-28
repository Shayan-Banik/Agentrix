import { getModel } from "../config/LLMmodels.js";

const ROUTES = new Set(["chat", "coding", "search", "pdf", "ppt", "imageGen"]);

function inferExplicitRoute(prompt) {
    const text = prompt.toLowerCase();
    if (/\b(create|generate|make|draw|edit)\b.*\b(image|picture|photo|logo|illustration|art)\b/.test(text)) return "imageGen";
    if (/\b(create|generate|make|build|convert|export)\b.*\b(ppt|powerpoint|presentation|slides)\b/.test(text)) return "ppt";
    if (/\b(create|generate|make|build|convert|export)\b.*\b(pdf|document)\b/.test(text)) return "pdf";
    if (/\b(fix|debug|write|implement|refactor|build|create|code)\b.*\b(code|function|component|api|app|script|class|react|javascript|typescript|python|sql)\b/.test(text)) return "coding";
    if (/\b(current|latest|today|now|recent|news|weather|price|live|search|browse|find online|look up)\b/.test(text)) return "search";
    return null;
}

export const router = async (state) => {
    if (state.agentMode && state.agentMode !== "auto") {
        return {
            ...state,
            agent: state.agentMode === "image" ? "imageGen" : state.agentMode,
        };
    }

    const explicitRoute = inferExplicitRoute(state.prompt);
    if (explicitRoute) {
        return { ...state, agent: explicitRoute };
    }

    const llm = await getModel("router");
    const prompt = `
        You are an agent router.
        Available agents:
        - chat
        - coding
        - search
        - pdf
        - ppt
        - imageGen
        
        Rules:

        chat:
        General conversation,
        Explanations,
        Learning,
        Questions

        search:
        Current events,
        latest information
        news.
        recent developments,
        current issues,
        internet lookup

        coding:
        Coding related tasks,
        Generate code,
        debug code,
        build projects
        architecture
        API design

        pdf:
        Create a pdf
        Generate a pdf or document context

        ppt:
        Create a ppts
        Generate a ppts or ppt context

        imageGen:
        Create an image
        Generate an image context

        return ONLY one word:
        chat
        coding
        search
        pdf
        ppt
        imageGen

        User Query:
        ${state.prompt}

    `;

    try {
        const response = await llm.invoke(prompt);
        const routedAgent = String(response.content || "")
            .trim()
            .toLowerCase()
            .match(/\b(chat|coding|search|pdf|ppt|imagegen)\b/)?.[1];
        return {
            ...state,
            agent: ROUTES.has(routedAgent) ? routedAgent : "chat",
        };
    } catch (error) {
        console.error("Agent routing failed:", error);
        return { ...state, agent: "chat" };
    }
}