import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildContributionBody,
  buildContributionUrl,
  objectPageUrl,
} from '../domain/contribution';
import type { ObjectRecord } from '../domain/types';
import { useLocale } from '../i18n';

interface ContributionPanelProps {
  object: ObjectRecord | null;
  onClose: () => void;
}

/**
 * A plain, visible form. It composes text and hands it to a public channel the
 * reader chooses to open; the page itself stores nothing.
 */
export function ContributionPanel({ object, onClose }: ContributionPanelProps) {
  const { locale, strings } = useLocale();
  const [details, setDetails] = useState('');
  const [source, setSource] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [missing, setMissing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const detailsRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLTextAreaElement | null>(null);

  const draft = useMemo(
    () => ({
      objectId: object?.id ?? null,
      objectTitle: object?.titles.zh ?? null,
      pageUrl: objectPageUrl(object?.id ?? null, window.location.href),
      details,
      source,
      contact,
    }),
    [object, details, source, contact],
  );

  const body = useMemo(() => buildContributionBody(draft, locale), [draft, locale]);
  const issueUrl = useMemo(() => buildContributionUrl(draft, locale), [draft, locale]);
  const hasDetails = details.trim().length > 0;

  // A section that appears below the panes is easy to miss: move focus to its
  // heading so keyboard and screen-reader users land where the form starts.
  useEffect(() => {
    const opener = document.activeElement;
    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    headingRef.current?.scrollIntoView?.({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    detailsRef.current?.focus({ preventScroll: true });
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(body);
        setStatus('copied');
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      // Older browsers and non-secure contexts: selecting the preview is the
      // fallback, and it does not pretend the copy succeeded.
      if (previewRef.current) {
        previewRef.current.focus();
        previewRef.current.select();
      }
      setStatus('failed');
    }
  };

  return (
    <section className="contribute" aria-labelledby="contribute-heading">
      <div className="contribute__head">
        <div>
          <h2 id="contribute-heading" ref={headingRef} className="contribute__title" tabIndex={-1}>
            {strings.contributeTitle}
          </h2>
          {draft.objectTitle ? (
            <p className="contribute__for">{strings.contributeFor(draft.objectTitle)}</p>
          ) : null}
        </div>
        <button type="button" className="icon-button" aria-label={strings.contributeClose} onClick={onClose}>
          ×
        </button>
      </div>

      <p className="contribute__intro">{strings.contributeIntro}</p>

      <div className="contribute__grid">
        <div className="contribute__field">
          <label className="contribute__label" htmlFor="contribute-details">
            {strings.contributeDetailsLabel}
          </label>
          <textarea
            id="contribute-details"
            ref={detailsRef}
            className="contribute__input contribute__textarea"
            rows={5}
            value={details}
            placeholder={strings.contributeDetailsPlaceholder}
            onChange={(event) => {
              setDetails(event.target.value);
              if (missing) setMissing(false);
            }}
            aria-describedby={missing ? 'contribute-error' : undefined}
          />
          {missing ? (
            <p id="contribute-error" className="contribute__error" role="alert">
              {strings.contributeRequired}
            </p>
          ) : null}
        </div>

        <div className="contribute__field">
          <label className="contribute__label" htmlFor="contribute-source">
            {strings.contributeSourceLabel}
          </label>
          <textarea
            id="contribute-source"
            className="contribute__input contribute__textarea"
            rows={3}
            value={source}
            placeholder={strings.contributeSourcePlaceholder}
            onChange={(event) => setSource(event.target.value)}
          />
        </div>

        <div className="contribute__field">
          <label className="contribute__label" htmlFor="contribute-contact">
            {strings.contributeContactLabel}
          </label>
          <input
            id="contribute-contact"
            className="contribute__input"
            type="text"
            value={contact}
            placeholder={strings.contributeContactPlaceholder}
            onChange={(event) => setContact(event.target.value)}
          />
        </div>
      </div>

      <p className="contribute__notice">{strings.contributeNotice}</p>

      <div className="contribute__preview">
        <label className="contribute__label" htmlFor="contribute-preview">
          {strings.contributePreviewLabel}
        </label>
        <textarea
          id="contribute-preview"
          ref={previewRef}
          className="contribute__input contribute__textarea contribute__preview-text"
          rows={9}
          readOnly
          value={body}
        />
      </div>

      <div className="contribute__actions">
        {hasDetails ? (
          <a
            className="button button--primary"
            href={issueUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            {strings.contributeSubmit}
          </a>
        ) : (
          <button
            type="button"
            className="button button--primary"
            aria-disabled="true"
            onClick={() => setMissing(true)}
          >
            {strings.contributeSubmit}
          </button>
        )}
        <button type="button" className="button" onClick={copy}>
          {strings.contributeCopy}
        </button>
        {status === 'copied' ? (
          <span className="contribute__status" role="status">
            {strings.contributeCopied}
          </span>
        ) : null}
        {status === 'failed' ? (
          <span className="contribute__status contribute__status--warn" role="status">
            {strings.contributeCopyFailed}
          </span>
        ) : null}
      </div>

      <p className="contribute__channel">{strings.contributeChannelNote}</p>
    </section>
  );
}
