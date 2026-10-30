import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Eyebrow } from '@/components/shared/primitives';

export function ClosingCta({
  eyebrow = 'NEXT',
  headline,
  body,
}: {
  eyebrow?: string;
  headline: string;
  body: string;
}) {
  return (
    <section className="border-y border-hairline bg-surface-1">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-16 md:px-8 md:py-20 lg:px-12">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="max-w-[24ch] text-h2 text-text-primary">{headline}</h2>
        <p className="max-w-[60ch] text-body text-text-secondary">{body}</p>
        <div className="pt-2">
          <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
