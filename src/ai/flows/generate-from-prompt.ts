'use server';

/**
 * @fileOverview Generates code from a given prompt using AI.
 *
 * - generateCode - A function that generates code based on a textual prompt.
 * - GenerateFromPromptInput - The input type for the generateCode function.
 * - GenerateFromPromptOutput - The return type for the generateCode function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const GenerateFromPromptInputSchema = z.object({
  prompt: z.string().describe('The natural language prompt describing the code to generate.'),
  language: z.string().default('C#').describe('The programming language to generate the code in.'),
});
export type GenerateFromPromptInput = z.infer<typeof GenerateFromPromptInputSchema>;

const GenerateFromPromptOutputSchema = z.object({
  output: z.string().describe('The generated code as a string.'),
});
export type GenerateFromPromptOutput = z.infer<typeof GenerateFromPromptOutputSchema>;

export async function generateCode(
  input: GenerateFromPromptInput
): Promise<GenerateFromPromptOutput> {
  // Ensure default language if missing
  const lang = input.language || 'C#';
  return generateFromPromptFlow({ prompt: input.prompt, language: lang });
}

const codePrompt = ai.definePrompt({
  name: 'generateFromPromptPrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('The natural language prompt for code generation.'),
      language: z.string().describe('Programming language to use.'),
    }),
  },
  output: {
    schema: z.object({
      output: z.string().describe('The AI-generated code output.'),
    }),
  },
  prompt: `You are an AI assistant specialized in generating code.

Please generate {{language}} code according to the following prompt:

"""
{{prompt}}
"""

Provide the complete code implementation only, without additional commentary.`,
});

const generateFromPromptFlow = ai.defineFlow<
  typeof GenerateFromPromptInputSchema,
  typeof GenerateFromPromptOutputSchema
>(
  {
    name: 'generateFromPromptFlow',
    inputSchema: GenerateFromPromptInputSchema,
    outputSchema: GenerateFromPromptOutputSchema,
  },
  async input => {
    const { output } = await codePrompt(input);
    return output!;
  }
);
