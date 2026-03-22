export function emptyToNull(s: string | null | undefined) {
  if (s === undefined || s === null || s === "") return null;
  return s;
}
