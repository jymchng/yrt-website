import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * `eslint-config-next` v16 ships **flat** configs. Passing them through
 * `FlatCompat` (the pre-v15 recipe) makes ESLint try to JSON-stringify a config
 * graph that contains circular plugin references and it crashes with
 * "Converting circular structure to JSON". Spread the exported arrays instead.
 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'docs/**', 'tests/.cassette/**', 'playwright-report/**'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Brief §2/§6: strict TypeScript, no `any`, no non-null assertions.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'react/jsx-no-target-blank': 'error',
    },
  },
];

export default config;
