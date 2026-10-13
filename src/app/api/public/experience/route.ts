import { getPublicExperience } from "@/lib/public-data";

export const revalidate = 60;

export async function GET() {
  const experience = await getPublicExperience();
  return Response.json(experience);
}
