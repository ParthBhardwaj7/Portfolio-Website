import { revalidatePath } from "next/cache";

/** Call after any admin mutation so the public home page picks up DB changes immediately. */
export function revalidatePublicPages() {
  revalidatePath("/", "page");
  revalidatePath("/", "layout");
}
