import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Initialize Google Generative AI API client
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY environment variable not set.");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" }, {
  apiVersion: 'v1beta',
});

export const generateIepGoal = action({
  args: { plafp: v.string() },
  handler: async (ctx, { plafp }) => {
    try {
      // Request to generate IEP Goal via Gemini API
      const result = await model.generateContent([
        {
          text: `You are an assistant that helps to generate IEP goals based on the provided Present Levels of Academic Performance (PLAFP). Please generate a detailed IEP goal based on the following Present Levels of Performance: ${plafp}`,
        },
      ]);

      // Handling result from the API
      const generatedGoal = result.response.text ? result.response.text() : "Goal generation failed.";
      // Split the generated goal into tokens (words)
      const tokens = generatedGoal.split(" ");      

      // Simulate slow loading of each token
      const simulateLoading = (tokens: string[]) => {
        return new Promise<string>((resolve) => {
          let index = 0;
          let displayedGoal = "";

          const intervalId = setInterval(() => {
            if (index < tokens.length) {
              displayedGoal += tokens[index] + " ";
              index++;
            } else {
              clearInterval(intervalId);
              resolve(displayedGoal.trim());
            }
          }, 5); // Adjust delay for token-by-token simulation
        });
      };

      // Simulate token-by-token loading of the SMART goal
      const simulatedGoal = await simulateLoading(tokens);
      const formattedGoal = `
        <h3>IEP Goal: Reading Fluency and Decoding Multisyllabic Words</h3>
        <p><strong>Student:</strong> [Student's Name]</p>
        <p><strong>Area of Need:</strong> Reading Fluency and Decoding</p>
        <p><strong>Goal:</strong> ${simulatedGoal}</p>
      `;

      console.log(simulatedGoal);

      return formattedGoal;
    } catch (error) {
      console.error("Error generating IEP goal:", error);
      return "There was an error generating the goal.";
    }
  },
});
