import { getModel } from "../config/LLMmodels.js";
import { generatePdf } from "../utils/generatePdf.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";

export const pdfAgent = async (state) => {
  try {
    const llm = await getModel("pdf");
    const prompt = `
    You are an expert pdf or document writer.

    Return ONLY valid JSON

    Do Not Return Markdown

    Do Not return explanations.

    Structure:

    {
      "title": "",
      "subtitle": "",
      "sections": [
        {
          "heading": "",
          "points": [],
        }
      ]
    }

    Generate 4-8 sections

    Each section should have 3-6 concise bullet points.

    Topic:

    ${state.prompt}
    `;
    const response = await llm.invoke(prompt);
    const data = JSON.parse(response.content);
    const pdfBuffer = await generatePdf(data);

    const filename = `pdf-${Date.now()}.pdf`;
    await uploadToS3(filename, pdfBuffer, "application/pdf");

    const downloadUrl = await getFromS3(filename, 10 * 60); // 10 minutes
    return {
      ...state,
      files: [
        {
          url: downloadUrl,
          title: data.title || "Generated PDF",
        },
      ],
      aiResponse: [
        "# PDF Generated Successfully",
        "",
        `**${data.title || "Generated PDF"}**`,
        "",
        `[Download PDF](${downloadUrl})`,
        "",
        "Link expires in 10 minutes.",
      ].join("\n"),
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      ...state,
      aiResponse: "Error generating PDF. Please try again later.",
    };
  }
};
