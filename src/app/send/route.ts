import { appRoute } from "@genkit-ai/next";
import {
  GenerateResponseChunkSchema,
  GenerateResponseSchema,
} from "genkit/model";
import { ai, z } from "./genkit";
import { generateRecipe } from "./generate-recipe";
import { searchRestaurants } from "./search-restaurants";

const dinnerSuggestionFlow = ai.defineFlow(
  {
    name: "dinnerSuggestion",
    inputSchema: z.object({
      message: z.string(),
      preferences: z.any(),
    }),
    outputSchema: GenerateResponseSchema,
    streamSchema: GenerateResponseChunkSchema,
  },
  async (request) => {
    const response = await ai.generate({
      messages: [
        {
          role: "system",
          content: [
            {
              text: `You are a helpful assistant. If the user asks with help preparing a meal, use the generateRecipe tool. If they ask about restaurants or where to eat, use the searchRestaurants tool to find restaurants by cuisine type.

User's preferences: ${JSON.stringify(request.preferences, null, 2)}

- DO NOT repeat the contents of generated recipes or restaurant details in your text reply to the user. Generated content will be displayed above your response.
- DO NOT ask the user for dietary preferences or preferred cuisines as they are provided above.`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              text: request.message,
            },
          ],
        },
      ],
      tools: [generateRecipe, searchRestaurants],
      // onChunk: (chunk) => sendChunk(chunk.toJSON()),
      context: { preferences: request.preferences },
    });
    return response.toJSON();
  }
);

export const POST = appRoute(dinnerSuggestionFlow);

export async function DELETE(request: Request) {
  return Response.json({ message: "History reset" }, { status: 200 });
}