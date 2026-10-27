import { getModel } from "../config/LLMmodels.js";

export const chatAgent = async (state) => {

    const llm = await getModel("chat");
    const prompt = "Yor are Agentrix AI, an intelligent assistant";
    const response = await llm.invoke([
        {
            role: "system",
            content: prompt
        },
        {
            role: "human",
            content: state.prompt
        }
    ]);

    return {
        ...state,
        aiResponse: response.content,
    };

}