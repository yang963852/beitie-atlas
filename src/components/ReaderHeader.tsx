import { useLocale } from '../i18n';
import { LocaleSwitch } from './LocaleSwitch';
import './atlas-timeline.css';

export type ReaderSection = 'catalogue' | 'collections' | 'library';

/**
 * The shared masthead and section nav for the three catalogue entries:
 * 知识库, 历史脉络 and 馆藏地图. Only the content below the nav differs.
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
      <a href="#/library" aria-current={active === 'library' ? 'page' : undefined}>{zh ? '知识库' : 'Library'}</a>
      <a href="#catalogue" aria-current={active === 'catalogue' ? 'page' : undefined}>{zh ? '历史脉络' : 'Chronology'}</a>
      <a href="#/collections" aria-current={active === 'collections' ? 'page' : undefined}>{zh ? '馆藏地图' : 'Collection map'}</a>
    </nav>
  </>;
}
