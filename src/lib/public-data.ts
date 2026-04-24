import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getPublicAbout = cache(async () => {
  try {
    return await prisma.about.findFirst();
  } catch {
    return null;
  }
});

export type PublicSkillCategory = {
  id: string;
  title: string;
  sortOrder: number;
  items: { id: string; label: string; sortOrder: number }[];
};

export const getPublicSkillCategories = cache(async (): Promise<PublicSkillCategory[]> => {
  try {
    const rows = await prisma.skillCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
      },
    });
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
});

export const getPublicPortfolio = cache(async () => {
  try {
    const rows = await prisma.portfolio.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
});

export const getPublicCertifications = cache(async () => {
  try {
    const rows = await prisma.certification.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
});

export const getPublicSocial = cache(async () => {
  try {
    const s = await prisma.social.findFirst();
    return (
      s ?? {
        github: null as string | null,
        linkedin: null as string | null,
        instagram: null as string | null,
        twitter: null as string | null,
      }
    );
  } catch {
    return {
      github: null,
      linkedin: null,
      instagram: null,
      twitter: null,
    };
  }
});
