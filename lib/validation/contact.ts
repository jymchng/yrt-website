import { z } from 'zod';

export const contactSubjects = [
  'General enquiry',
  'Research collaboration',
  'Engineering',
  'Data or press',
  'Something else',
] as const;

export type ContactSubject = (typeof contactSubjects)[number];

export const MESSAGE_MIN = 20;
/** The counter appears once the writer is this close to the limit (§6.7). */
export const MESSAGE_SOFT_LIMIT = 1800;
export const MESSAGE_MAX = 2000;

/**
 * One schema, used by the client island and re-run on the server. Client
 * validation is never trusted (brief §7); the server action parses the raw
 * FormData again and ignores anything the browser claimed.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters.')
    .max(80, 'Keep the name under 80 characters.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter an email address.')
    .max(160, 'Keep the address under 160 characters.')
    .email('Enter an email address in the form name@example.com.'),
  subject: z.enum(contactSubjects, { message: 'Choose a subject.' }),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, `Write at least ${MESSAGE_MIN} characters so we can reply usefully.`)
    .max(MESSAGE_MAX, `Keep the message under ${MESSAGE_MAX} characters.`),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Field-level errors keyed by field name, ready for `aria-describedby`. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const flat = z.flattenError(error);
  const errors: Record<string, string> = {};

  for (const [field, messages] of Object.entries(flat.fieldErrors)) {
    const [first] = messages as string[] | undefined ?? [];
    if (first) errors[field] = first;
  }

  const [formError] = flat.formErrors;
  if (formError) errors.form = formError;

  return errors;
}
