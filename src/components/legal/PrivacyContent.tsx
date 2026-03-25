'use client';

import { useI18n } from '@/lib/i18n/context';
import { siteConfig } from '@/lib/site-config';

export function PrivacyContent() {
  const { t, locale } = useI18n();
  const p = t.privacy;
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
          <p>{n(p.s1Intro)}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{p.s1i1}</li>
            <li>{p.s1i2}</li>
            <li>{p.s1i3}</li>
            <li>{p.s1i4}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s2Title}</h2>
          <p>{p.s2Intro}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{p.s2i1}</li>
            <li>{p.s2i2}</li>
            <li>{p.s2i3}</li>
            <li>{p.s2i4}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s3Title}</h2>
          <p>{p.s3Text}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s4Title}</h2>
          <p>{p.s4Intro}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{p.s4i1}</li>
            <li>{p.s4i2}</li>
            <li>{p.s4i3}</li>
            <li>{p.s4i4}</li>
          </ul>
          <p>{p.s4Outro}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s5Title}</h2>
          <p>{p.s5Text}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s6Title}</h2>
          <p>{p.s6Intro}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{p.s6i1}</li>
            <li>{p.s6i2}</li>
            <li>{p.s6i3}</li>
            <li>{p.s6i4}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s7Title}</h2>
          <p>{p.s7Text}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">{p.s8Title}</h2>
          <p>{p.s8Text}</p>
        </section>
      </div>
    </div>
  );
}
