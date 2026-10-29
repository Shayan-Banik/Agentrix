import axios from "axios";
import { getModel } from "../config/LLMmodels.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";

function getProviderErrorDetail(error) {
  let responseData = error?.response?.data;

  if (Buffer.isBuffer(responseData)) {
    responseData = responseData.toString("utf8");
  } else if (responseData instanceof ArrayBuffer) {
    responseData = Buffer.from(responseData).toString("utf8");
  }

  if (typeof responseData === "string") {
    try {
      responseData = JSON.parse(responseData);
    } catch {
      return "";
    }
  }

  const providerError = responseData?.error;
  return [
    providerError?.message,
    providerError?.code,
    responseData?.message,
  ].find((detail) => typeof detail === "string" && detail.trim()) || "";
}

export const imageGenAgent = async (state) => {
  const llm = await getModel("imageGen");
  const response = await llm.invoke(`
  You are an elite AI Image prompt engineer.

  Convert the user rquest into a highly detailed image generation prompt.

  Requirements:

  - Cinematic lighting
  - Professional composition
  - Ultra realistic
  - High detailed
  - Beautiful color palette
  - Sharp focus
  - 8k quality
  - Photorealistic
  - Depth of field
  - Professional photography
  - Stunning Visuals

  Return only the image prompt.

  User Request:
  ${state.prompt}

  `);
  const prompt = response.content.trim();

  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  let imgRes;

  try {
    imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
  } catch (error) {
    const status = error?.response?.status;
    const detail = getProviderErrorDetail(error);
    const message = detail
      ? `Pollinations image generation failed (${status || "unknown status"}): ${detail}`
      : `Pollinations image generation failed (${status || "unknown status"}).`;
    const providerError = new Error(message, { cause: error });
    providerError.status = status;
    providerError.provider = "Pollinations";
    throw providerError;
  }

  const buffer = Buffer.from(imgRes.data);
  const filename = `image-${Date.now()}.png`;

  await uploadToS3(filename, buffer, "image/png");
  const downloadImageUrl = await getFromS3(filename, 10 * 60);
  return {
    ...state,
    images: [
      {
        url: downloadImageUrl,
        title: "Generated image",
      },
    ],
    aiResponse: [
      "# Image Generated Successfully",
      "",
      `[Download Image](${downloadImageUrl})`,
      "",
      "Link expires in 10 minutes.",
    ].join("\n"),
  };
};
