import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Source-level guards for the brief's hard constraints. These are cheap and
 * catch the regressions that review tends to miss: an HTML sink, a committed
 * secret, or a client island creeping onto a page that does not need one.
 */

const ROOT = process.cwd();
const SCANNED = ['app', 'components', 'lib'];

function walk(dir: string): string[] {
  const full = join(ROOT, dir);
  const entries = readdirSync(full);
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(full, entry);
    if (statSync(path).isDirectory()) {
      files.push(...walk(join(dir, entry)));
    } else if (/\.[jt]sx?$/.test(entry)) {
      files.push(path);
    }
  }

  return files;
}

const sourceFiles = SCANNED.flatMap(walk);

function read(files: readonly string[]): { path: string; text: string }[] {
  return files.map((path) => ({ path, text: readFileSync(path, 'utf8') }));
}

const sources = read(sourceFiles);

describe('source integrity', () => {
  it('found the application sources', () => {
    expect(sources.length).toBeGreaterThan(30);
  });

  it('never injects raw HTML', () => {
    // The bare phrase appears in comments explaining that it is *not* used, so
    // the guard matches the JSX assignment itself.
    const offenders = sources.filter((file) => /dangerouslySetInnerHTML\s*=/.test(file.text));
    expect(offenders, `unexpected HTML sink in ${offenders.map((f) => f.path).join(', ')}`).toEqual([]);
  });

  it('emits JSON-LD through a script child, not an escaped string', () => {
    const jsonld = sources.find((file) => file.path.endsWith('lib/seo/jsonld.tsx'));
    expect(jsonld).toBeDefined();
    expect(jsonld?.text).toMatch(/<script type="application\/ld\+json">\{JSON\.stringify\(data\)\}<\/script>/);
  });

  it('commits no API keys or secrets', () => {
    const patterns = [/re_[A-Za-z0-9]{20,}/, /sk-[A-Za-z0-9]{20,}/, /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];
    for (const file of sources) {
      for (const pattern of patterns) expect(file.text).not.toMatch(pattern);
    }
  });

  it('uses only token colours in components (no ad-hoc hex)', () => {
    const componentSources = sources.filter((file) => file.path.includes(`${'components'}/`));
    for (const file of componentSources) {
      const hex = file.text.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
      expect(hex, `${file.path} contains a literal colour: ${hex.join(', ')}`).toEqual([]);
    }
  });

  it('keeps client islands declared and discoverable', () => {
    const clientFiles = sources.filter((file) => /^'use client';/m.test(file.text));
    const allowed = [
      'mobile-nav.tsx',
      'nav-links.tsx',
      'research-filter.tsx',
      'contact-form.tsx',
      'hero-visual.tsx',
      'dashboard-preview.tsx',
      'article-actions.tsx',
      'accordion.tsx',
      'dialog.tsx',
      'dropdown-menu.tsx',
      'select.tsx',
      'separator.tsx',
      'sheet.tsx',
      'tabs.tsx',
      'tooltip.tsx',
      'error.tsx',
      'global-error.tsx',
    ];

    const unexpected = clientFiles
      .map((file) => file.path.split('/').at(-1) ?? '')
      .filter((name) => !allowed.includes(name));
    expect(unexpected, `undeclared client islands: ${unexpected.join(', ')}`).toEqual([]);
  });
});
