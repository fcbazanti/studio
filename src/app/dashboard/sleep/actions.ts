'use server';

import { analyzeSleepAndRecommend, type SleepAnalysisInput } from '@/ai/flows/sleep-analysis-and-recommendations';
import { z } from 'zod';

const SleepSchema = z.object({
  bedtime: z.string(),
  wakeUpTime: z.string(),
});

type FormState = {
  data: { weeklyRecommendation: string } | null;
  error: string | null;
};

export async function getSleepRecommendation(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const validatedFields = SleepSchema.safeParse({
      bedtime: formData.get('bedtime'),
      wakeUpTime: formData.get('wakeUpTime'),
    });

    if (!validatedFields.success) {
      return {
        data: null,
        error: 'Invalid data provided. Please check your times.',
      };
    }

    const input: SleepAnalysisInput = validatedFields.data;
    const result = await analyzeSleepAndRecommend(input);
    return { data: result, error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: 'Failed to get recommendation from AI. Please try again later.',
    };
  }
}
