import { z } from "zod/v4";

export const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.email("Please enter a valid email"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20)
    .regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid phone number"),
  source: z.string().default("landing_page"),
  message: z.string().max(1000).optional(),
  language: z.enum(["en", "fr"]).optional(),
});

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
