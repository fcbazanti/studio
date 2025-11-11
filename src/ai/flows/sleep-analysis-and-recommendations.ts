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

const DayScheduleSchema = z.object({
  bedtime: z.string().describe("The user's bedtime for this day, in HH:mm format."),
  wakeUpTime: z.string().describe("The user's wake-up time for this day, in HH:mm format."),
});

const SleepAnalysisInputSchema = z.object({
  sleepSchedule: z.object({
    monday: DayScheduleSchema.optional(),
    tuesday: DayScheduleSchema.optional(),
    wednesday: DayScheduleSchema.optional(),
    thursday: DayScheduleSchema.optional(),
    friday: DayScheduleSchema.optional(),
    saturday: DayScheduleSchema.optional(),
    sunday: DayScheduleSchema.optional(),
  }).describe("The user's sleep schedule for the entire week."),
});
export type SleepAnalysisInput = z.infer<typeof SleepAnalysisInputSchema>;

const SleepRecommendationOutputSchema = z.object({
  weeklyRecommendation: z
    .string()
    .describe(
      `A recommendation on the user's weekly sleep schedule. 
       Analyze the consistency of bedtimes and wake-up times, and total sleep duration for each day.
       Provide actionable advice to improve their sleep hygiene.
       If the schedule is good, the recommendation should be positive and encouraging.
       The recommendation should be a few sentences long.
      `
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
  prompt: `You are a sleep analysis expert. Based on the user's weekly sleep schedule, provide a recommendation.

   Analyze the consistency of their bedtimes, wake-up times, and total sleep duration for each day. Note any large variations, especially between weekdays and weekends.
   
   Here is the user's schedule:
   {{#if sleepSchedule.monday}}Monday: Bedtime: {{{sleepSchedule.monday.bedtime}}}, Wake-up: {{{sleepSchedule.monday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.tuesday}}Tuesday: Bedtime: {{{sleepSchedule.tuesday.bedtime}}}, Wake-up: {{{sleepSchedule.tuesday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.wednesday}}Wednesday: Bedtime: {{{sleepSchedule.wednesday.bedtime}}}, Wake-up: {{{sleepSchedule.wednesday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.thursday}}Thursday: Bedtime: {{{sleepSchedule.thursday.bedtime}}}, Wake-up: {{{sleepSchedule.thursday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.friday}}Friday: Bedtime: {{{sleepSchedule.friday.bedtime}}}, Wake-up: {{{sleepSchedule.friday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.saturday}}Saturday: Bedtime: {{{sleepSchedule.saturday.bedtime}}}, Wake-up: {{{sleepSchedule.saturday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.sunday}}Sunday: Bedtime: {{{sleepSchedule.sunday.bedtime}}}, Wake-up: {{{sleepSchedule.sunday.wakeUpTime}}}{{/if}}

   Provide actionable advice to improve their sleep hygiene. If the schedule is good and consistent, the recommendation should be positive and encouraging.
   The recommendation should be a few sentences long.`,
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

    