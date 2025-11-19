import { z } from 'zod';

export const citySchema = z.object({
  name: z.string().min(1, 'City name required'),
  radius_miles: z.number().min(5).max(100),
  weight: z.number().min(0).max(100)
});

export const step1Schema = z.object({
  cities: z.array(citySchema).min(1, 'At least one city required')
});

export const step2Schema = z.object({
  categories: z.array(z.string()).min(1, 'At least one job title required')
});

export const configSchema = z.object({
  cities: z.array(citySchema),
  categories: z.array(z.string()),
  include_keywords: z.array(z.string()),
  exclude_keywords: z.array(z.string()),
  salary_usd: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }),
  posted_within_hours: z.number()
});
