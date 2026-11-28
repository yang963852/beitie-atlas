import { useId } from 'react';
import type { Claim } from '../domain/types';
import { detectLang } from '../domain/text';
import { useLocale } from '../i18n';
import { SourceList } from './SourceList';

export function ClaimSection({ claims }: { claims?: Claim[] }) {
  const { locale, strings } = useLocale();
  const headingId = useId();
  if (!claims?.length) return null;
  return <section className="section" aria-labelledby={headingId}>
    <h3 id={headingId} className="section__heading">{strings.claimsHeading}</h3>
    <ul className="claims">
      {claims.map((claim) => {
        const note = locale === 'zh' ? claim.noteZh ?? claim.note : claim.note;
        const attribution = [claim.voice, claim.locator].filter(Boolean).join(' · ');
        return <li key={claim.id}>
          <p><strong lang={detectLang(claim.value)}>{claim.value}</strong> <span className="tag">{strings.claimKindLabels[claim.kind]}</span> <span className="tag">{strings.claimStanceLabels[claim.stance]}</span></p>
          {attribution && <p className="section__meta" lang={detectLang(attribution)}>{attribution}</p>}
          {note ? <p className="section__note" lang={detectLang(note)}>{note}</p> : null}
          <SourceList ids={claim.sourceRefs} compact />
        </li>;
      })}
    </ul>
  </section>;
}
