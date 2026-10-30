import { describe, expect, it } from 'vitest';

import { MESSAGE_MAX, MESSAGE_MIN, contactSchema, contactSubjects, fieldErrorsFrom } from '@/lib/validation/contact';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Research collaboration',
  message: 'We have been measuring half-lives on a small FX universe and would like to compare notes on shrinkage.',
};

describe('contactSchema', () => {
  it('accepts a well-formed payload and trims the text fields', () => {
    const parsed = contactSchema.safeParse({ ...valid, name: '  Ada Lovelace  ', email: ' ada@example.com ' });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe('Ada Lovelace');
      expect(parsed.data.email).toBe('ada@example.com');
    }
  });

  it('rejects a name that is too short', () => {
    const parsed = contactSchema.safeParse({ ...valid, name: 'A' });
    expect(parsed.success).toBe(false);
  });

  it.each(['not-an-email', 'a@b', '@example.com', '', 'two words@example.com'])('rejects the email %s', (email) => {
    expect(contactSchema.safeParse({ ...valid, email }).success).toBe(false);
  });

  it('only accepts a subject from the fixed list', () => {
    expect(contactSchema.safeParse({ ...valid, subject: 'Something else' }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, subject: 'Sales' }).success).toBe(false);
    expect(contactSubjects).toContain(valid.subject);
  });

  it('enforces the message length window at both ends', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'x'.repeat(MESSAGE_MIN - 1) }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: 'x'.repeat(MESSAGE_MIN) }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, message: 'x'.repeat(MESSAGE_MAX + 1) }).success).toBe(false);
  });

  it('rejects a message that is only whitespace', () => {
    expect(contactSchema.safeParse({ ...valid, message: ' '.repeat(MESSAGE_MIN + 5) }).success).toBe(false);
  });

  it('rejects missing fields outright', () => {
    expect(contactSchema.safeParse({}).success).toBe(false);
  });
});

describe('fieldErrorsFrom', () => {
  it('reduces a Zod error to one message per field', () => {
    const parsed = contactSchema.safeParse({ ...valid, name: '', email: 'nope' });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const errors = fieldErrorsFrom(parsed.error);
    expect(Object.keys(errors).sort()).toEqual(['email', 'name']);
    expect(errors.name).toBe('Enter at least 2 characters.');
    expect(errors.email).toContain('name@example.com');
  });

  it('returns no entries for a valid payload', () => {
    const parsed = contactSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
