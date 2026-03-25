'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { siteConfig } from '@/lib/site-config';

export function TermsContent() {
  const { t, locale } = useI18n();
  const p = t.terms;
  const n = (s: string) => s.replace('{name}', siteConfig.name);
  const dateLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-ES';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">{p.title}</h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
        <p className="text-gray-400 text-sm">
          {p.lastUpdated}: {new Date().toLocaleDateString(dateLocale)}
        </p>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s1Title}</h2>
          <p>{n(p.s1Text)}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s2Title}</h2>
          <p>{n(p.s2Text)}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s3Title}</h2>
          <p>{p.s3Intro}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{p.s3i1}</li>
            <li>{p.s3i2}</li>
            <li>{p.s3i3}</li>
            <li>{p.s3i4}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s4Title}</h2>
          <p>{n(p.s4Text)}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s5Title}</h2>
          <p>{n(p.s5Text)}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s6Title}</h2>
          <p>{n(p.s6Text)}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s7Title}</h2>
          <p>{p.s7Text}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s8Title}</h2>
          <p>
            {p.s8Text}{' '}
            <Link href="/dmca" className="text-neon-blue hover:underline">DMCA</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
