import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email");

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(128, "Too long")
  // at least 3 of: lower, upper, number, symbol
  .refine((s) => {
    const lower = /[a-z]/.test(s);
    const upper = /[A-Z]/.test(s);
    const digit = /\d/.test(s);
    const sym = /[^A-Za-z0-9]/.test(s);
    return [lower, upper, digit, sym].filter(Boolean).length >= 3;
  }, "Use 3 of: lowercase, UPPERCASE, number, symbol");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
