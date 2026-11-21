import { z } from "zod";

export const passwordRequirements = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  minimumLength: 6,
} as const;

export const registrationSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.email("Enter a valid email address."),
  image: z
    .string()
    .trim()
    .pipe(z.union([z.literal(""), z.url("Enter a valid photo URL.")])),
  password: z
    .string()
    .min(
      passwordRequirements.minimumLength,
      "Password must be at least 6 characters.",
    )
    .regex(
      passwordRequirements.uppercase,
      "Password must include an uppercase letter.",
    )
    .regex(
      passwordRequirements.lowercase,
      "Password must include a lowercase letter.",
    ),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
