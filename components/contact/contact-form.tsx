'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

import { submitContact, type ContactResult } from '@/app/contact/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  MESSAGE_MAX,
  MESSAGE_MIN,
  MESSAGE_SOFT_LIMIT,
  contactSchema,
  contactSubjects,
  fieldErrorsFrom,
  type ContactSubject,
} from '@/lib/validation/contact';

/**
 * The contact island (design-system §6.7, brief §4.6).
 *
 * Client validation exists to make mistakes cheap to fix; it is never trusted.
 * The server action re-parses the raw FormData and can return `invalid` for a
 * payload that passed here. Every result state is rendered in words as well as
 * colour, inside an `aria-live="polite"` region.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactResult | null, FormData>(submitContact, null);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState<ContactSubject>('General enquiry');
  const [message, setMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const startedAtRef = useRef<HTMLInputElement>(null);

  /**
   * The minimum-time spam check needs a mount stamp. Writing it through the ref
   * keeps `Date.now()` off the server render (no hydration mismatch) and keeps
   * the effect free of `setState`, which React's compiler lint rule forbids.
   */
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  /**
   * Server-reported field errors are *derived*, never copied into state: an
   * effect that mirrors `state` into `errors` renders twice and can show a
   * stale message for one frame. Deriving keeps a single source of truth.
   */
  const errors: Record<string, string> =
    state?.status === 'invalid' ? { ...localErrors, ...state.fieldErrors } : localErrors;

  const validate = (formData: FormData) => {
    const parsed = contactSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      subject,
      message: formData.get('message'),
    });
    return parsed.success ? {} : fieldErrorsFrom(parsed.error);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    formData.set('subject', subject);
    const nextErrors = validate(formData);
    setLocalErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      const first = Object.keys(nextErrors)[0];
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  };

  const messageLength = message.trim().length;
  const counterVisible = message.length >= MESSAGE_SOFT_LIMIT;
  const atLimit = message.length >= MESSAGE_MAX;

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="name" label="Name" error={errors.name} required>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'name-error' : undefined}
            onBlur={(event) => {
              const value = event.target.value.trim();
              setLocalErrors((current) => ({
                ...current,
                ...(value.length < 2 ? { name: 'Enter at least 2 characters.' } : { name: '' }),
              }));
            }}
          />
        </Field>

        <Field id="email" label="Email" error={errors.email} required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </Field>
      </div>

      <Field id="subject" label="Subject" error={errors.subject} required>
        <Select value={subject} onValueChange={(value) => setSubject(value as ContactSubject)} name="subject">
          <SelectTrigger id="subject" aria-invalid={errors.subject ? true : undefined} aria-describedby={errors.subject ? 'subject-error' : undefined}>
            <SelectValue placeholder="Choose a subject" />
          </SelectTrigger>
          <SelectContent>
            {contactSubjects.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field id="message" label="Message" error={errors.message} required hint={`${MESSAGE_MIN}–${MESSAGE_MAX} characters.`}>
        <Textarea
          id="message"
          name="message"
          required
          maxLength={MESSAGE_MAX}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={[errors.message ? 'message-error' : null, 'message-hint', counterVisible ? 'message-counter' : null]
            .filter(Boolean)
            .join(' ')}
        />
        {counterVisible ? (
          <p
            id="message-counter"
            className={`font-mono text-caption ${atLimit ? 'text-warning' : 'text-text-tertiary'}`}
          >
            {messageLength} / {MESSAGE_MAX} characters{atLimit ? ' — at the limit, trim before sending' : ''}
          </p>
        ) : null}
      </Field>

      {/* Honeypot: hidden from sight, from the tab order and from the a11y tree. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />

      <div className="flex flex-col gap-3 border-t border-hairline pt-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <Button type="submit" variant="primary" size="lg" disabled={pending}>
            {pending ? 'Sending…' : 'Send enquiry'}
          </Button>
          <p className="font-mono text-caption text-text-tertiary">
            {pending
              ? 'Sending is disabled while the previous submission is in flight.'
              : 'Delivery depends on this deployment’s mail configuration — the result is always stated explicitly.'}
          </p>
        </div>
        <p className="max-w-[40ch] font-mono text-caption text-text-tertiary">
          No marketing list, no third-party tracking on this form.
        </p>
      </div>

      <div aria-live="polite" role="status" className="flex flex-col gap-2">
        <StatusMessage state={state} />
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small text-text-primary">
        {label}
        {required ? (
          <span className="ml-1 text-text-tertiary">(required)</span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="font-mono text-caption text-text-tertiary">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-caption text-negative">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StatusMessage({ state }: { state: ContactResult | null }) {
  if (!state) return null;

  if (state.status === 'delivered') {
    return (
      <div className="flex items-start gap-3 rounded-md border border-accent/40 bg-wash-simulated p-4">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
        <div className="flex flex-col gap-1">
          <p className="text-small text-text-primary">Message delivered.</p>
          <p className="text-caption text-text-secondary">
            The mail provider accepted the message. A reply, if there is one, comes from a person.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'not-configured') {
    return (
      <div className="flex items-start gap-3 rounded-md border border-warning/40 bg-wash-caution p-4">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
        <div className="flex flex-col gap-1">
          <p className="text-small text-text-primary">Not sent — this deployment has no mail credentials.</p>
          <p className="text-caption text-text-secondary">
            Missing configuration: <span className="font-mono">{state.missing.join(', ')}</span>. The message was{' '}
            <strong className="text-text-primary">not delivered</strong> and nothing was queued.
          </p>
          <p className="text-caption text-text-secondary">
            Set those variables (see <span className="font-mono">.env.example</span>) or email us directly at the
            address beside this form.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'invalid') {
    return (
      <div className="flex items-start gap-3 rounded-md border border-negative/40 bg-wash-critical p-4">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-negative" />
        <div className="flex flex-col gap-1">
          <p className="text-small text-text-primary">Not sent — the message did not pass validation.</p>
          <p className="text-caption text-text-secondary">
            The server rejected the submission and {Object.keys(state.fieldErrors).length} field(s) need attention.
            Errors are shown beside the fields.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'rate-limited') {
    return (
      <div className="flex items-start gap-3 rounded-md border border-warning/40 bg-wash-caution p-4">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
        <div className="flex flex-col gap-1">
          <p className="text-small text-text-primary">Not sent — too many submissions from this address.</p>
          <p className="text-caption text-text-secondary">
            Try again in {state.retryAfterSeconds} seconds. Nothing was sent this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-negative/40 bg-wash-critical p-4">
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-negative" />
      <div className="flex flex-col gap-1">
        <p className="text-small text-text-primary">Not sent — delivery failed.</p>
        <p className="text-caption text-text-secondary">
          {state.reason} Nothing was delivered. Please email us directly at the address beside this form.
        </p>
        <p className="font-mono text-caption text-text-tertiary">
          <Badge variant="critical">Undelivered</Badge>
        </p>
      </div>
    </div>
  );
}
