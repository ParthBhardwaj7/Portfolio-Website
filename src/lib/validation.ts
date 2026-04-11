import { z } from "zod";

const optionalUrlOrPath = z
  .string()
  .max(2000)
  .optional()
  .nullable()
  .refine(
    (val) =>
      val === undefined ||
      val === null ||
      val === "" ||
      val.startsWith("/uploads/") ||
      val.startsWith("https://") ||
      val.startsWith("http://"),
    "Must be a valid URL or /uploads/ path"
  );

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(64),
  password: z.string().min(1, "Password is required").max(256),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email").max(254),
  role: z.string().min(1, "Role is required").max(120),
  message: z.string().min(1, "Message is required").max(5000),
});

export const portfolioCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(10000),
  image: optionalUrlOrPath,
  link: optionalUrlOrPath,
  galleryCaption: z.string().max(500).optional().nullable(),
  videoUrl: optionalUrlOrPath,
});

export const portfolioItemUpdateSchema = portfolioCreateSchema.extend({
  id: z.string().uuid(),
});

export const skillCategoryCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
});

export const skillCategoryUpdateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
});

export const skillItemCreateSchema = z.object({
  categoryId: z.string().uuid("Invalid category"),
  label: z.string().min(1, "Label is required").max(2000),
});

export const skillItemUpdateSchema = z.object({
  label: z.string().min(1).max(2000).optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
});

export const aboutUpdateSchema = z.object({
  content: z.string().min(1, "Content is required").max(20000),
  profileImage: optionalUrlOrPath,
  heroTagline: z.string().max(800).optional().nullable(),
  contactCaption: z.string().max(800).optional().nullable(),
  resumeUrl: optionalUrlOrPath,
  favicon: optionalUrlOrPath,
  ogImage: optionalUrlOrPath,
});

export const socialUpdateSchema = z.object({
  github: optionalUrlOrPath,
  linkedin: optionalUrlOrPath,
  instagram: optionalUrlOrPath,
  twitter: optionalUrlOrPath,
});
