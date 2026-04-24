import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function jsonError(message: string, status: number, code?: string) {
  return Response.json({ error: message, code: code ?? "ERROR" }, { status });
}

function isInitError(e: unknown) {
  return (
    e instanceof Prisma.PrismaClientInitializationError ||
    (typeof e === "object" &&
      e !== null &&
      (e as { name?: string }).name === "PrismaClientInitializationError")
  );
}

export function handleRouteError(e: unknown) {
  if (e instanceof ZodError) {
    const first = Array.isArray(e.errors) && e.errors.length > 0 ? e.errors[0] : null;
    return jsonError(first?.message ?? "Validation failed", 400, "VALIDATION");
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P1001" || e.code === "P1002") {
      return jsonError("Database unavailable. Try again later.", 503, "DB_UNAVAILABLE");
    }
    if (e.code === "P2002") {
      return jsonError("A record with this value already exists.", 409, "DUPLICATE");
    }
    if (e.code === "P2025") {
      return jsonError("Record not found.", 404, "NOT_FOUND");
    }
    if (e.code === "P2003") {
      return jsonError("Related record not found.", 400, "FK_CONSTRAINT");
    }
  }
  if (isInitError(e)) {
    return jsonError("Database unavailable. Try again later.", 503, "DB_UNAVAILABLE");
  }
  console.error(e);
  return jsonError("Something went wrong.", 500, "INTERNAL");
}
