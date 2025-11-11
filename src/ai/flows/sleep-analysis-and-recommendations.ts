'use server';
/**
 * @fileOverview Analyzes user sleep patterns and provides weekly sleep recommendations.
 *
 * - analyzeSleepAndRecommend - Analyzes sleep data and provides recommendations.
 * - SleepAnalysisInput - The input type for the analyzeSleepAndRecommend function.
 * - SleepRecommendationOutput - The return type for the analyzeSleepAndRecommend function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SleepAnalysisInputSchema = z.object({
  bedtime: z.string().describe('The user\u0027s usual bedtime, in HH:mm format (e.g., 22:30).'),
  wakeUpTime: z.string().describe('The user\u0027s usual wake-up time, in HH:mm format (e.g., 07:00).'),
});
export type SleepAnalysisInput = z.infer<typeof SleepAnalysisInputSchema>;

const SleepRecommendationOutputSchema = z.object({
  weeklyRecommendation: z
    .string()
    .describe(
      'A recommendation on whether the user needs to sleep more or less, based on their sleep data.
       If the user should maintain their current sleep schedule, the recommendation should be positive and encouraging.
       The recommendation should be no more than two sentences long.
      '
    ),
});
export type SleepRecommendationOutput = z.infer<typeof SleepRecommendationOutputSchema>;

export async function analyzeSleepAndRecommend(
  input: SleepAnalysisInput
): Promise<SleepRecommendationOutput> {
  return analyzeSleepAndRecommendFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sleepAnalysisPrompt',
  input: {schema: SleepAnalysisInputSchema},
  output: {schema: SleepRecommendationOutputSchema},
  prompt: `You are a sleep analysis expert. Based on the user's bedtime of {{{bedtime}}} and wake-up time of {{{wakeUpTime}}}, provide a weekly recommendation on whether they need to sleep more or less.

   If the user should maintain their current sleep schedule, the recommendation should be positive and encouraging.
   The recommendation should be no more than two sentences long.`,
});

const analyzeSleepAndRecommendFlow = ai.defineFlow(
  {
    name: 'analyzeSleepAndRecommendFlow',
    inputSchema: SleepAnalysisInputSchema,
    outputSchema: SleepRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
