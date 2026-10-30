import { Skeleton } from '@/components/ui/skeleton';

/**
 * Design-system §14.3: the skeleton mirrors the real block sizes so nothing
 * shifts when content arrives. The mono `LOADING` line appears after one second
 * (`.loading-line` in globals.css), so a skeleton is never the only signal, and
 * the wrapper is announced as busy.
 */
export default function Loading() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-16 md:px-8 md:py-20 lg:px-12">
      <div className="flex flex-col gap-4 border-b border-hairline pb-10">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-[min(24ch,60%)]" />
        <Skeleton className="h-5 w-[min(60ch,90%)]" />
        <Skeleton className="h-5 w-[min(48ch,70%)]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      <Skeleton className="h-64 w-full" />

      <p className="loading-line font-mono text-caption text-text-tertiary">LOADING</p>
    </div>
  );
}
