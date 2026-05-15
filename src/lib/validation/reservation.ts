import { z } from 'zod';

/**
 * Single source of truth for reservation validation. Used by the
 * react-hook-form resolver (client) AND the API route (server).
 *
 * Every message is an i18n KEY under the `booking` namespace, resolved
 * through next-intl at render time (client) or returned as-is (server).
 */
export const reservationSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: 'errors.name' })
    .max(100, { message: 'errors.tooLong' }),
  customerEmail: z.string().email({ message: 'errors.email' }),
  customerPhone: z
    .string()
    .min(7, { message: 'errors.phone' })
    .max(20, { message: 'errors.phone' }),
  artistName: z
    .string()
    .max(100, { message: 'errors.tooLong' })
    .optional()
    .or(z.literal('')),
  serviceType: z.enum(['recording', 'mixing', 'mastering', 'beat', 'vocal'], {
    errorMap: () => ({ message: 'errors.service' }),
  }),
  sessionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'errors.date' }),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, { message: 'errors.time' }),
  durationHours: z.union(
    [z.literal(1), z.literal(2), z.literal(4), z.literal(8)],
    { errorMap: () => ({ message: 'errors.duration' }) }
  ),
  projectDescription: z
    .string()
    .max(2000, { message: 'errors.tooLong' })
    .optional()
    .or(z.literal('')),
  referenceLinks: z
    .string()
    .max(1000, { message: 'errors.tooLong' })
    .optional()
    .or(z.literal('')),
  locale: z.enum(['tr', 'en']).default('tr'),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

/** Flatten zod errors into `{ field: messageKey }`. */
export function fieldErrors(
  error: z.ZodError
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
