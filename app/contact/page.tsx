import { Eyebrow, PageIntro, Section, SectionShell } from '@/components/shared/primitives';
import { ContactForm } from '@/components/contact/contact-form';
import { siteMeta } from '@/lib/site';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Contact',
  description:
    'Contact Yishun River Trading about research collaboration, engineering roles or a specific question. The form states its delivery result explicitly; nothing is reported as sent unless it was.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <SectionShell>
      <Section className="flex flex-col gap-10">
        <PageIntro
          eyebrow="Contact"
          title="Contact"
          lead="Send a specific question, a pointer to your work, or a note about something on this site that looks wrong. Concrete is easier to answer than general."
        />

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h2 className="mb-6 text-h3 text-text-primary">Send an enquiry</h2>
            <ContactForm />
          </div>

          <aside className="flex flex-col gap-8 lg:col-span-5">
            <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-card p-5 md:p-6">
              <Eyebrow>Direct</Eyebrow>
              <address className="flex flex-col gap-2 text-body-sm text-text-secondary not-italic">
                <a
                  href={`mailto:${siteMeta.email}`}
                  className="inline-flex min-h-11 items-center rounded-sm font-mono text-info-text hover:underline md:min-h-0"
                >
                  {siteMeta.email}
                </a>
                <span className="font-mono text-caption text-text-tertiary">Singapore · no office address published</span>
              </address>
            </div>

            <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-card p-5 md:p-6">
              <Eyebrow>Delivery, stated plainly</Eyebrow>
              <p className="text-body-sm text-text-secondary">
                This form sends through a transactional mail provider. If the deployment has no credentials, the
                submission returns a <strong className="text-text-primary">not configured</strong> state that names
                the missing variables and says the message was not sent.
              </p>
              <p className="text-caption text-text-tertiary">
                Spam handling is local: a hidden field, a minimum-time check and an in-memory rate limit. No third-party
                captcha is used, and no message content is sent anywhere except the configured mailbox.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-card p-5 md:p-6">
              <Eyebrow>What we will not do</Eyebrow>
              <ul className="flex flex-col gap-2 text-body-sm text-text-secondary">
                <li>Add you to a list you did not ask for.</li>
                <li>Quote performance figures — we publish method, not returns.</li>
                <li>Claim a delivery that did not happen.</li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </SectionShell>
  );
}
