import { z } from "zod";

export const settingsFormSchema = z.object({
  platforms: z.array(z.string().trim().min(1).max(40)),
  categories: z.array(z.string().trim().min(1).max(40)),
  monthly_profit_goal: z.number().min(0).max(1_000_000),
});

export type SettingsFormInput = z.input<typeof settingsFormSchema>;
