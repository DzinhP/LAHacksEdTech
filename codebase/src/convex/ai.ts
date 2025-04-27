import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateIepGoal = action({
  args: { plafp: v.string() },
  handler: async (ctx, { plafp }) => {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key missing");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4", // or "gpt-3.5-turbo" if you prefer cheaper
        messages: [
          {
            role: "system",
            content: "You are an expert special education teacher. Write clear, concise, SMART academic goals based on student's present levels.",
          },
          {
            role: "user",
            content: `Student's present levels: "${plafp}". Write one SMART academic goal.`,
          },
        ],
        temperature: 0.2,
      }),
    });

    const result = await response.json();
    const smartGoal = result?.choices?.[0]?.message?.content ?? "Goal generation failed.";

    return smartGoal;
  },
});
