'use server';

import { analyzeSleepAndRecommend, type SleepAnalysisInput } from '@/ai/flows/sleep-analysis-and-recommendations';
import { z } from 'zod';

const DayScheduleSchema = z.object({
  bedtime: z.string(),
  wakeUpTime: z.string(),
});

const SleepScheduleSchema = z.object({
  monday: DayScheduleSchema.optional(),
  tuesday: DayScheduleSchema.optional(),
  wednesday: DayScheduleSchema.optional(),
  thursday: DayScheduleSchema.optional(),
  friday: DayScheduleSchema.optional(),
  saturday: DayScheduleSchema.optional(),
  sunday: DayScheduleSchema.optional(),
});

const FormSchema = z.object({
  sleepSchedule: z.string().transform((str, ctx) => {
    try {
      return SleepScheduleSchema.parse(JSON.parse(str));
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON for sleep schedule' });
      return z.NEVER;
    }
  }),
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
    const validatedFields = FormSchema.safeParse({
      sleepSchedule: formData.get('sleepSchedule'),
    });

    if (!validatedFields.success) {
      return {
        data: null,
        error: 'Invalid data provided. Please check your schedule.',
      };
    }

    const input: SleepAnalysisInput = {
      sleepSchedule: validatedFields.data.sleepSchedule,
    };
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

    