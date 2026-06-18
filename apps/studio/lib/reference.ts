/**
 * Computes the next internal reference code (`DZTS-###`) from the existing
 * ones. Values that don't match `DZTS-<digits>` are ignored. The result is
 * zero-padded to 3 digits (`DZTS-042`); it grows to 4+ digits after `DZTS-999`.
 */
export function nextReference(existing: (string | null)[]): string {
  const max = existing.reduce((m, ref) => {
    const n = /^DZTS-(\d+)$/.exec(ref ?? "")?.[1];
    return n ? Math.max(m, Number(n)) : m;
  }, 0);
  return `DZTS-${String(max + 1).padStart(3, "0")}`;
}
