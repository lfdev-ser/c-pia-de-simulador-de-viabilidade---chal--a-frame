export const DIMENSION_MIN = 0;

export function parseDimensionInput(value: string, fallback = 0): number {
  const normalized = value.trim().replace(',', '.');
  if (normalized === '') return fallback;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < DIMENSION_MIN) return fallback;

  return parsed;
}

export function formatDimensionInput(value: number): string {
  return value === 0 ? '' : String(value);
}
