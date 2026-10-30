import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The contact server action is the one place where a wrong answer is a security
 * and integrity problem, so it is tested directly: every branch of the result
 * union, plus the spam traps.
 */
const harness = vi.hoisted(() => ({
  ip: '203.0.113.7',
  sendResult: { error: null as { message: string } | null },
  sendCalls: 0,
}));

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': harness.ip }),
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: async () => {
        harness.sendCalls += 1;
        return harness.sendResult;
      },
    };
  },
}));

const REQUIRED_ENV = ['RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL'] as const;

const VALID_FIELDS = {
  name: 'Grace Hopper',
  email: 'grace@example.com',
  subject: 'Engineering',
  message: 'We are building a matching-engine simulator and would like to compare latency budgets with you.',
};

function buildForm(overrides: Record<string, string> = {}, startedAt = Date.now() - 60_000): FormData {
  const form = new FormData();
  const fields = { ...VALID_FIELDS, ...overrides };
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  form.set('startedAt', String(startedAt));
  return form;
}

async function loadAction() {
  vi.resetModules();
  return import('@/app/contact/actions');
}

beforeEach(() => {
  harness.ip = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
  harness.sendResult = { error: null };
  harness.sendCalls = 0;
  for (const name of REQUIRED_ENV) delete process.env[name];
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  for (const name of REQUIRED_ENV) delete process.env[name];
});

describe('submitContact — validation', () => {
  it('returns field errors for a payload the browser should have blocked', async () => {
    const { submitContact } = await loadAction();
    const result = await submitContact(null, buildForm({ email: 'nope', message: 'short' }));

    expect(result.status).toBe('invalid');
    if (result.status !== 'invalid') return;
    expect(result.fieldErrors.email).toBeDefined();
    expect(result.fieldErrors.message).toBeDefined();
  });
});

describe('submitContact — spam traps', () => {
  it('discards a submission with a filled honeypot and sends nothing', async () => {
    const { submitContact } = await loadAction();
    const form = buildForm({ website: 'https://spam.example' });
    const result = await submitContact(null, form);

    expect(result.status).toBe('rate-limited');
    expect(harness.sendCalls).toBe(0);
  });

  it('discards a submission completed faster than a human could type', async () => {
    const { submitContact } = await loadAction();
    const result = await submitContact(null, buildForm({}, Date.now()));

    expect(result.status).toBe('rate-limited');
    expect(harness.sendCalls).toBe(0);
  });

  it('does not treat a missing mount stamp as a spam signal', async () => {
    const { submitContact } = await loadAction();
    const form = buildForm();
    form.delete('startedAt');
    const result = await submitContact(null, form);

    // Falls through the timing gate to the configuration check.
    expect(result.status).toBe('not-configured');
  });

  it('rate-limits the sixth valid submission from one address', async () => {
    const { submitContact } = await loadAction();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const result = await submitContact(null, buildForm());
      expect(result.status).toBe('not-configured');
    }

    const blocked = await submitContact(null, buildForm());
    expect(blocked.status).toBe('rate-limited');
    if (blocked.status !== 'rate-limited') return;
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe('submitContact — provider boundary', () => {
  it('names every missing variable and never claims delivery', async () => {
    const { submitContact } = await loadAction();
    const result = await submitContact(null, buildForm());

    expect(result.status).toBe('not-configured');
    if (result.status !== 'not-configured') return;
    expect([...result.missing].sort()).toEqual([...REQUIRED_ENV].sort());
    expect(harness.sendCalls).toBe(0);
  });

  it('names only the variable that is actually missing', async () => {
    process.env.CONTACT_TO_EMAIL = 'research@yishunriver.com';
    process.env.CONTACT_FROM_EMAIL = 'site@yishunriver.com';
    const { submitContact } = await loadAction();
    const result = await submitContact(null, buildForm());

    expect(result).toEqual({ status: 'not-configured', missing: ['RESEND_API_KEY'] });
  });

  it('reports delivered only when the provider accepts the message', async () => {
    for (const name of REQUIRED_ENV) process.env[name] = 'test-placeholder';
    const { submitContact } = await loadAction();

    expect(await submitContact(null, buildForm())).toEqual({ status: 'delivered' });
    expect(harness.sendCalls).toBe(1);
  });

  it('reports a transport failure as failed, never as delivered', async () => {
    for (const name of REQUIRED_ENV) process.env[name] = 'test-placeholder';
    harness.sendResult = { error: { message: 'invalid api key' } };
    const { submitContact } = await loadAction();

    const result = await submitContact(null, buildForm());
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') return;
    expect(result.reason.length).toBeGreaterThan(0);
  });
});
