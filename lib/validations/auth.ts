import { z } from "zod";
import { AVATAR_COLORS } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères"),
  username: z
    .string()
    .min(3, "Au moins 3 caractères")
    .max(24, "Au plus 24 caractères")
    .regex(/^[a-z0-9_-]+$/, "Lettres minuscules, chiffres, _ ou - uniquement"),
  full_name: z
    .string()
    .min(2, "Au moins 2 caractères")
    .max(60, "Au plus 60 caractères"),
  color: z
    .string()
    .refine((v) => (AVATAR_COLORS as readonly string[]).includes(v), {
      message: "Couleur non autorisée",
    }),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Au moins 3 caractères")
    .max(24, "Au plus 24 caractères")
    .regex(/^[a-z0-9_-]+$/, "Lettres minuscules, chiffres, _ ou - uniquement"),
  full_name: z
    .string()
    .min(2, "Au moins 2 caractères")
    .max(60, "Au plus 60 caractères"),
  color: z
    .string()
    .refine((v) => (AVATAR_COLORS as readonly string[]).includes(v), {
      message: "Couleur non autorisée",
    }),
  monthly_profit_goal: z
    .number({ error: "Doit être un nombre" })
    .min(0, "Doit être positif")
    .max(1_000_000, "Trop grand")
    .nullable(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
