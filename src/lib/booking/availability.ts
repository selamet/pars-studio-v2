import { STUDIO_HOURS, TIME_SLOTS } from './services';

export type BookedSlot = { start_time: string; duration_hours: number };

/** "21:00" or "21:00:00" → 21 */
export function hourOf(time: string): number {
  return parseInt(time.slice(0, 2), 10);
}

/** Two half-open ranges [s, s+d) overlap? */
export function rangesOverlap(
  aStart: number,
  aDur: number,
  bStart: number,
  bDur: number
): boolean {
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

/**
 * Does a candidate session (start hour + duration) collide with any
 * existing booking, or run past closing time?
 */
export function hasConflict(
  candidateStart: number,
  candidateDuration: number,
  booked: BookedSlot[]
): boolean {
  if (candidateStart + candidateDuration > STUDIO_HOURS.close) return true;
  return booked.some((b) =>
    rangesOverlap(
      candidateStart,
      candidateDuration,
      hourOf(b.start_time),
      b.duration_hours
    )
  );
}

/**
 * Which TIME_SLOTS are unavailable for the chosen duration: either they
 * overlap an existing booking or the session would run past `close`.
 */
export function unavailableStartTimes(
  booked: BookedSlot[],
  duration: number
): Set<string> {
  const blocked = new Set<string>();
  for (const slot of TIME_SLOTS) {
    const start = hourOf(slot);
    if (hasConflict(start, duration, booked)) blocked.add(slot);
  }
  return blocked;
}
