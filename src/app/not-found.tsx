import type { Metadata } from "next";
import { NotFoundContent } from "@/components/not-found-content";

export const metadata: Metadata = {
  title: "404 | Not found",
  description: "Page not found.",
};

export default function NotFound() {
  return <NotFoundContent />;
}
