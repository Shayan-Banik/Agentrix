import { TavilySearch } from "@langchain/tavily";

const searchTool = new TavilySearch({
  maxResults: 5,
  topic: "general",
  includeImages: true,
});

export default searchTool;