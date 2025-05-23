'use server';

/**
 * @fileOverview Optimizes a coding-related prompt using AI.
 *
 * - optimizeCodePrompt - A function that optimizes a code prompt.
 * - OptimizeCodePromptInput - The input type for the optimizeCodePrompt function.
 * - OptimizeCodePromptOutput - The return type for the optimizeCodePrompt function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const OptimizeCodePromptInputSchema = z.object({
  originalPrompt: z
    .string()
    .describe('The original coding-related prompt to be optimized.'),
  selectedLanguage: z
    .string()
    .default('C#')
    .describe('The language of the code you are trying to generate. Defaults to C#.'),
});
export type OptimizeCodePromptInput = z.infer<typeof OptimizeCodePromptInputSchema>;

const OptimizeCodePromptOutputSchema = z.object({
  optimizedPrompt: z
    .string()
    .describe('The optimized coding-related prompt generated by AI.'),
});
export type OptimizeCodePromptOutput = z.infer<typeof OptimizeCodePromptOutputSchema>;

export async function testButton(input:OptimizeCodePromptInput): Promise<OptimizeCodePromptOutput> {
  return {
    optimizedPrompt: "This is a test string",
  }
}


export async function optimizeCodePrompt(
  input: OptimizeCodePromptInput
): Promise<OptimizeCodePromptOutput> {
  // Ensure default is applied if input.selectedLanguage is missing or empty
  const language = input.selectedLanguage || 'C#';
  return optimizeCodePromptFlow({
    originalPrompt: input.originalPrompt,
    selectedLanguage: language,
  });
}

const prompt = ai.definePrompt({
  name: 'optimizeCodePromptPrompt',
  input: {
    schema: z.object({
      originalPrompt: z
        .string()
        .describe('The original coding-related prompt to be optimized.'),
      selectedLanguage: z
        .string()
        .describe('The language of the code you are trying to generate.'),
    }),
  },
  output: {
    schema: z.object({
      optimizedPrompt: z
        .string()
        .describe('The optimized coding-related prompt generated by AI.'),
    }),
  },
  prompt: `You are an AI expert in prompt engineering, specializing in optimizing prompts for code generation.

  Your goal is to refine the given prompt to elicit higher-quality and more relevant code generation from language models.
  Consider factors such as clarity, specificity, and the inclusion of relevant context or constraints.

  Please generate code in {{selectedLanguage}} and do not use other languages.

  Original Prompt: {{{originalPrompt}}}

  Optimized Prompt:`,
});

const optimizeCodePromptFlow = ai.defineFlow<
  typeof OptimizeCodePromptInputSchema,
  typeof OptimizeCodePromptOutputSchema
>(
  {
    name: 'optimizeCodePromptFlow',
    inputSchema: OptimizeCodePromptInputSchema,
    outputSchema: OptimizeCodePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
