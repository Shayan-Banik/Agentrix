import { getModel } from "../config/LLMmodels.js"

export const router = async (state) => {
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

    const response = await llm.invoke(prompt);
    console.log("response", response);
    return {
        ...state,
        agent: response.content.trim().toLowerCase(),
    };
}