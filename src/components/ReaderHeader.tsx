import { useLocale } from '../i18n';
import { LocaleSwitch } from './LocaleSwitch';
import './atlas-timeline.css';

export type ReaderSection = 'catalogue' | 'collections' | 'library';

/**
 * The shared masthead and section nav for the three reading entries:
 * 访碑, 编年 and 读帖, plus lightweight 关于 / 共建 links to the two static
 * pages. Only the content below the nav differs.
 */
export function ReaderHeader({ active }: { active: ReaderSection }) {
  const { locale, strings } = useLocale();
  const zh = locale === 'zh';
  return <>
    <header className="atlas-mast">
      <a href="#" className="atlas-brand">
        <span className="atlas-seal" aria-hidden="true">碑</span>
        {strings.siteTitleZh}
        <small>Between Steles</small>
      </a>
      <LocaleSwitch />
    </header>
    <nav className="reader-sections" aria-label={strings.sectionsLabel}>
      <a href="#/collections" aria-current={active === 'collections' ? 'page' : undefined}>{zh ? '访碑' : 'Atlas'}</a>
      <a href="#catalogue" aria-current={active === 'catalogue' ? 'page' : undefined}>{zh ? '编年' : 'Chronology'}</a>
      <a href="#/library" aria-current={active === 'library' ? 'page' : undefined}>{zh ? '读帖' : 'Reading room'}</a>
      <a href="#/about">{strings.navAbout}</a>
      <a href="#/join">{strings.navJoin}</a>
    </nav>
  </>;
}
