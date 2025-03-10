import { CUISINES, DIETARY_RESTRICTIONS } from "../constants";
import { ai, z } from "./genkit";

export const RecipeSchema = z.object({
  name: z.string(),
  description: z.string().describe("a brief description of the recipe"),
  cuisine: z.enum(CUISINES),
  dietaryRestrictions: z
    .array(z.enum(DIETARY_RESTRICTIONS))
    .describe("the dietary restrictions this meal is compatible with."),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
    })
  ),
  steps: z.array(z.string()).describe("the steps needed to prepare the recipe"),
});
export type Recipe = z.infer<typeof RecipeSchema>;

export const generateRecipe = ai.defineTool(
  {
    name: "generateRecipe",
    description: "generate a recipe based on a description",
    inputSchema: z.object({
      description: z
        .string()
        .describe("a text description of the recipe that might include ingredients to include"),
    }),
    outputSchema: RecipeSchema,
  },
  async ({ description }, { context }) => {
    const { output } = await ai.generate({
      prompt: `Generate a delicious recipe based on the provided description. Be sure to take into account the user's dietary restrictions and favorite cuisines:

User Preferences: ${JSON.stringify(context.preferences)}

Recipe Description: ${description}`,
      output: { schema: RecipeSchema },
    });
    return output!;
  }
);
