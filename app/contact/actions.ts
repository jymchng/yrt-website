'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';

import { contactSchema, fieldErrorsFrom } from '@/lib/validation/contact';
import { siteMeta } from '@/lib/site';

/**
 * The contact result is a discriminated union, so a "success" is not
 * representable on a failure path (implementation guide §6).
 *
 * `failed` is an addition to the guide's four branches: a transport error from
 * the mail provider is a real outcome, and the four-branch union could only
 * have represented it as `delivered` (a lie) or `invalid` (wrong). It never
 * renders as success.
 */
export type ContactResult =
  | { status: 'delivered' }
  | { status: 'not-configured'; missing: readonly string[] }
  | { status: 'invalid'; fieldErrors: Record<string, string> }
  | { status: 'rate-limited'; retryAfterSeconds: number }
  | { status: 'failed'; reason: string };

const REQUIRED_ENV = ['RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL'] as const;

/**
 * In-memory, per-instance rate limit. Documented limitation: a second instance
 * does not share this map, so the real limit is per instance, not per site.
 */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const buckets = new Map<string, number[]>();

function checkRateLimit(key: string, now: number): number | null {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (buckets.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (recent.length >= RATE_LIMIT_MAX) {
    const oldest = recent[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
    buckets.set(key, recent);
    return retryAfterSeconds;
  }

  recent.push(now);
  buckets.set(key, recent);
  return null;
}

const MIN_ELAPSED_MS = 3000;

export async function submitContact(_previous: ContactResult | null, formData: FormData): Promise<ContactResult> {
  const now = Date.now();
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  const clientKey = forwarded?.split(',')[0]?.trim() ?? headerList.get('x-real-ip') ?? 'unknown-client';

  const honeypot = String(formData.get('website') ?? '').trim();
  const startedAt = Number(formData.get('startedAt') ?? 0);
  const elapsed = Number.isFinite(startedAt) && startedAt > 0 ? now - startedAt : 0;

  /**
   * Spam mitigation without an external service (brief §7): a filled honeypot or
   * a submission faster than a human can type is discarded. The response is a
   * plausible non-success state rather than a fabricated success — the brief's
   * integrity constraint outranks a success-shaped decoy, and nothing is sent.
   */
  if (honeypot !== '' || (startedAt > 0 && elapsed < MIN_ELAPSED_MS)) {
    console.warn('[contact] submission discarded by spam trap', {
      honeypotFilled: honeypot !== '',
      elapsedMs: elapsed,
    });
    return { status: 'rate-limited', retryAfterSeconds: 60 };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return { status: 'invalid', fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const retryAfterSeconds = checkRateLimit(clientKey, now);
  if (retryAfterSeconds !== null) {
    return { status: 'rate-limited', retryAfterSeconds };
  }

  const missing = REQUIRED_ENV.filter((name) => {
    const value = process.env[name];
    return value === undefined || value.trim() === '';
  });

  if (missing.length > 0) {
    return { status: 'not-configured', missing };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  // The env check above guarantees these, but the types do not know that.
  if (!apiKey || !to || !from) {
    return { status: 'not-configured', missing: REQUIRED_ENV.filter((name) => !process.env[name]) };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: parsed.data.email,
      subject: `[${parsed.data.subject}] ${siteMeta.name} enquiry from ${parsed.data.name}`,
      text: [
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        `Subject: ${parsed.data.subject}`,
        '',
        parsed.data.message,
      ].join('\n'),
    });

    if (error) {
      console.error('[contact] provider rejected the message', error);
      return { status: 'failed', reason: 'The mail provider rejected the message.' };
    }

    return { status: 'delivered' };
  } catch (cause) {
    console.error('[contact] delivery threw', cause);
    return { status: 'failed', reason: 'The mail provider could not be reached.' };
  }
}
