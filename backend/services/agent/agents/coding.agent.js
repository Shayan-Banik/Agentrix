import { getModel } from "../config/LLMmodels.js";

export const codingAgent = async (state) => {
  const intentllm = await getModel("intent");
  const codingLlm = await getModel("coding");
  const fallbackLlm = await getModel("chat");

  const invokeCoding = async (prompt) => {
    try {
      return await codingLlm.invoke(prompt);
    } catch (error) {
      const status = error?.status || error?.statusCode || error?.response?.status;
      if (status === 402 || /insufficient balance/i.test(String(error?.message || error))) {
        console.warn("Coding provider has insufficient balance; falling back to Groq.");
        return fallbackLlm.invoke(prompt);
      }
      throw error;
    }
  };
  const intentRes = await intentllm.invoke(
    `
    You are an intent classifier.

    Return ONLY one of these value

    CODE_GENERATION
    CODE_REVIEW
    CODE_EXECUTION
    CODE_EXPLAINATION
    DEBUGGING
    OPTIMIZATION
    CONVERSATION
    DOCUMENTATION

    USER Request:
    ${state.prompt}

    `
  )
  const intentText = Array.isArray(intentRes.content)
    ? intentRes.content.map((part) => part?.text || part || "").join("\n")
    : String(intentRes.content || "");
  const validIntents = new Set([
    "CODE_GENERATION",
    "CODE_REVIEW",
    "CODE_EXECUTION",
    "CODE_EXPLAINATION",
    "DEBUGGING",
    "OPTIMIZATION",
    "CONVERSATION",
    "DOCUMENTATION",
  ]);
  const intent = intentText
    .trim()
    .split(/\s+/)
    .find((token) => validIntents.has(token)) || "CONVERSATION";

  if(intent === "CODE_GENERATION") {
    const prompt = `
    You are Agentrix AI, Coding Agent.

    Generate the requested project.

    Default stack:
    - HTML
    - CSS
    - JavaScript

    Default libraries:
    - React.js
    - Next.js
    - Vue

    Use React.js / Next.js / Vue / others ONLY if explicitly requested.

    Rules:

    - Responsive
    - Modern UI
    - Interactive
    - CSS Variables
    - Smooth scrolling
    - Hover effects
    - Easy to use
    - Easy to navigate
    - Easy to understand
    - Easy to maintain
    - Single page unless user asks otherwise

    Return ONLY valid JSON.

    Schema:
    {
      "files": [
        {
          "name": "index.html",
          "content": "..."
        },
        {
          "name": "style.css",
          "content": "..."
        },
        {
          "name": "script.js",
          "content": "..."
        }
      ]
    }

    Rules:

    - Output must starts with {
    - Output must ends with }
    - No markdown
    - No extra text
    - No explanation
    - No \`\`\`
    - Never mention intent

    USER Request:
    ${state.prompt}
    `;

      const response = await invokeCoding(prompt);
      const responseText = Array.isArray(response.content)
        ? response.content.map((part) => part?.text || part || "").join("\n")
        : String(response.content || "");
      const jsonText = responseText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data.files) || data.files.length === 0) {
        throw new Error("The coding model did not return any project files.");
      }
      return {
        ...state,
        aiResponse: "Code generated successfully.",
        artifacts: [
          {
            id: Date.now(),
            type: "Project",
            name: "Generated project",
            files: data.files || [],
          }
        ],
      };
  }

  const res = await invokeCoding(`
    The users request is

    ${intent}

    Return markdown only

    Never generate project files.

    Use headings likes:

    # Overview

    ## Explanation

    ## Problems

    ## Improvements

    ## Solution

    ## Best Practices

    ## Optimize code (if required / needed)

    User Requests:

    ${state.prompt}

    `);

    const data = res.content;
    return {
      ...state,
      aiResponse: data,
      artifacts: [],
    }

}
