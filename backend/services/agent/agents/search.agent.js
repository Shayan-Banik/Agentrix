import searchTool from "../config/tavily.js";

function parseSearchResults(results) {
  let parsed = results;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return { searchResults: [], images: [] };
    }
  }

  if (!Array.isArray(parsed?.results)) {
    return { searchResults: [], images: [] };
  }

  return {
    searchResults: parsed.results,
    images: Array.isArray(parsed.images)
      ? parsed.images
      : parsed.results.flatMap((result) => result?.images || []),
  };
}

export const searchAgent = async (state) => {
  try {
    const results = await searchTool.invoke({ query: state.prompt });
    return { ...state, ...parseSearchResults(results) };
  } catch (error) {
    console.error("Tavily search failed:", error);
    return { ...state, searchResults: [], images: [], searchError: "web-search" };
  }
};
