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
  bedtime: z.string().describe("Čas, kdy uživatel chodí spát, ve formátu HH:mm."),
  wakeUpTime: z.string().describe("Čas, kdy uživatel vstává, ve formátu HH:mm."),
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
  }).describe("Spánkový plán uživatele na celý týden."),
});
export type SleepAnalysisInput = z.infer<typeof SleepAnalysisInputSchema>;

const SleepRecommendationOutputSchema = z.object({
  weeklyRecommendation: z
    .string()
    .describe(
      `Doporučení ohledně týdenního spánkového plánu uživatele.
       Analyzujte konzistenci časů spánku a vstávání a celkovou dobu spánku pro každý den.
       Poskytněte konkrétní rady pro zlepšení spánkové hygieny.
       Pokud je plán dobrý, doporučení by mělo být pozitivní a povzbuzující.
       Doporučení by mělo být dlouhé několik vět.
       Odpovězte v češtině.
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
  prompt: `Jste expert na analýzu spánku. Na základě týdenního spánkového plánu uživatele poskytněte doporučení. Odpovězte v češtině.

   Analyzujte konzistenci jejich časů spánku, časů vstávání a celkové doby spánku pro každý den. Všimněte si jakýchkoli velkých odchylek, zejména mezi všedními dny a víkendy.
   
   Zde je plán uživatele:
   {{#if sleepSchedule.monday}}Pondělí: Spánek: {{{sleepSchedule.monday.bedtime}}}, Vstávání: {{{sleepSchedule.monday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.tuesday}}Úterý: Spánek: {{{sleepSchedule.tuesday.bedtime}}}, Vstávání: {{{sleepSchedule.tuesday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.wednesday}}Středa: Spánek: {{{sleepSchedule.wednesday.bedtime}}}, Vstávání: {{{sleepSchedule.wednesday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.thursday}}Čtvrtek: Spánek: {{{sleepSchedule.thursday.bedtime}}}, Vstávání: {{{sleepSchedule.thursday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.friday}}Pátek: Spánek: {{{sleepSchedule.friday.bedtime}}}, Vstávání: {{{sleepSchedule.friday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.saturday}}Sobota: Spánek: {{{sleepSchedule.saturday.bedtime}}}, Vstávání: {{{sleepSchedule.saturday.wakeUpTime}}}{{/if}}
   {{#if sleepSchedule.sunday}}Neděle: Spánek: {{{sleepSchedule.sunday.bedtime}}}, Vstávání: {{{sleepSchedule.sunday.wakeUpTime}}}{{/if}}

   Poskytněte konkrétní rady pro zlepšení jejich spánkové hygieny. Pokud je plán dobrý a konzistentní, doporučení by mělo být pozitivní a povzbuzující.
   Doporučení by mělo být dlouhé několik vět. Odpovězte v češtině.`,
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
