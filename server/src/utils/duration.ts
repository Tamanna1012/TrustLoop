const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000
};

/** Parses short durations like "15m", "7d", "30s" into milliseconds. */
export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Invalid duration format: "${duration}". Expected e.g. "15m", "7d".`);
  }
  const [, amount, unit] = match as unknown as [string, string, string];
  return Number(amount) * UNIT_MS[unit]!;
}
