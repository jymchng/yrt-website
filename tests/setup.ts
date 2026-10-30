import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/** Vitest runs without Jest's global hooks, so React Testing Library's own
 * auto-cleanup never registers. Registering it here keeps DOM state from
 * leaking between tests. */
afterEach(() => {
  cleanup();
});
