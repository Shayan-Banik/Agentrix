import { getModel } from "../config/LLMmodels.js";
import { generatePPT } from "../utils/generatePPT.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";

export const pptAgent = async (state) => {
  try {
    const llm = await getModel("ppt");
    const prompt = `
    You are an expert presentaion designer.

    Return ONLY valid JSON

    Format:

    {
      "title": "",
      "subtitle": "",
      "slides": [
        {
          "title": "",
          "points": [
            "",
            "",
            ""
          ],
        }
      ]
    }

    Rules:

    - Generate exactly 6 content slides (default if user ask more then add more slides )
    - Each slide should have 4-6 concise bullet points.
    - No markdown
    - No explanation
    - No code block
    - Return ONLY JSON

Topic:

${state.prompt}
    `;

    const response = await llm.invoke(prompt);
    // console.log(JSON.parse(response.content));
    const data = JSON.parse(response.content);
    const ppt = await generatePPT(data);
    const pptBuffer = await ppt.write({
      outputType: "nodebuffer",
    });

    const filename = `ppt-${Date.now()}.pptx`;
    await uploadToS3(
      filename,
      pptBuffer,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
    const downloadPptUrl = await getFromS3(filename, 10 * 60);

    return {
      ...state,
      files: [
        {
          url: downloadPptUrl,
          title: data.title || "Generated Presentation",
        },
      ],
      aiResponse: [
        "# ✅ Presentation Generated Successfully",
        "",
        `**${data.title || "Generated Presentation"}**`,
        "",
        `[Download PPT](${downloadPptUrl})`,
        "",
        "Link expires in 10 minutes.",
      ].join("\n"),
    };
  } catch (error) {
    console.log(" error", error);
    return {
      ...state,
      aiResponse: "Error generating PPT. Please try again later.",
    }
  }
};
