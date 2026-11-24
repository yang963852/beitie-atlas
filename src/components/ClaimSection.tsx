import { useId } from 'react';
import type { Claim } from '../domain/types';
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
        return <li key={claim.id}>
          <p><strong>{claim.value}</strong> <span className="tag">{strings.claimKindLabels[claim.kind]}</span> <span className="tag">{strings.claimStanceLabels[claim.stance]}</span></p>
          {(claim.voice || claim.locator) && <p className="section__meta">{[claim.voice, claim.locator].filter(Boolean).join(' · ')}</p>}
          {note ? <p className="section__note">{note}</p> : null}
          <SourceList ids={claim.sourceRefs} compact />
        </li>;
      })}
    </ul>
  </section>;
}
