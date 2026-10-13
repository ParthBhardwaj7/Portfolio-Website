/** Shared lightweight view-model types for the lab design. */

export type SocialLink = {
  id: string;
  label: string;
  href: string;
};

export type ProjectVM = {
  id: string;
  title: string;
  description: string;
  slug: string | null;
  techStack: string[];
  image: string | null;
  link: string | null;
  liveUrl: string | null;
  videoUrl: string | null;
  problem: string | null;
  solution: string | null;
  architecture: string | null;
  featured: boolean;
  gallery: { id: string; url: string; caption: string | null }[];
};

export type ExperienceVM = {
  id: string;
  year: string;
  title: string;
  org: string | null;
  type: string;
  description: string;
  technologies: string[];
  url: string | null;
};

export type SkillCategoryVM = {
  id: string;
  title: string;
  items: string[];
};

export type CertificationVM = {
  id: string;
  title: string;
  issuer: string;
  issueDate: string | null;
  credentialUrl: string | null;
  imageUrl: string | null;
  pdfUrl: string | null;
};

export type GalleryTileVM = {
  id: string;
  image: string | null;
  videoUrl: string | null;
  caption: string | null;
  projectTitle: string;
  slug: string | null;
};

export type OssStats = {
  mergedPRs: number;
  source: "live" | "snapshot";
  profile: {
    login: string;
    htmlUrl: string;
    publicRepos: number;
    followers: number;
  } | null;
  topRepos: {
    name: string;
    description: string | null;
    language: string | null;
    url: string;
    stars: number;
  }[];
};
