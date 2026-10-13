import { z } from "zod";

const optionalUrl = z
  .string()
  .max(2000)
  .optional()
  .nullable()
  .refine(
    (val) => val === undefined || val === null || val === "" || /^https?:\/\//.test(val),
    "Must be a valid http(s) URL"
  );

export const EXPERIENCE_TYPES = [
  "work",
  "project",
  "certification",
  "opensource",
  "milestone",
] as const;

export const experienceCreateSchema = z.object({
  year: z.string().min(1, "Year is required").max(40),
  title: z.string().min(1, "Title is required").max(200),
  org: z.string().max(200).optional().nullable(),
  type: z.enum(EXPERIENCE_TYPES).optional(),
  description: z.string().min(1, "Description is required").max(5000),
  technologies: z.string().max(1000).optional().nullable(),
  url: optionalUrl,
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export const experienceUpdateSchema = experienceCreateSchema.partial();
