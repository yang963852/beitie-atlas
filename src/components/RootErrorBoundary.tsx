import { Component, type ErrorInfo, type ReactNode } from 'react';
import { enStrings } from '../i18n/en';
import { zhStrings } from '../i18n/zh';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * The last resort when a render throws. Without it one bad record blanks the
 * page, and the reader gets a white screen with no way back.
 *
 * It sits above the locale provider, so it cannot call `useLocale`. It reads the
 * declared language from the document instead and takes its copy from the same
 * two dictionaries the rest of the interface uses, so no string is duplicated
 * here.
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Nothing is reported off-device; the console keeps the failure inspectable.
    console.error('[beitie] render failed', error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    const declared = (document.documentElement.lang || 'zh').toLowerCase();
    const strings = declared.startsWith('zh') ? zhStrings : enStrings;

    return (
      <div className="app">
        <div className="alert" role="alert">
          <p className="alert__title">{strings.crashTitle}</p>
          <p>{strings.crashBody}</p>
          <p className="mono">{error.message}</p>
          <p>
            <a className="topnav__link" href="#/">
              {strings.crashBack}
            </a>
          </p>
        </div>
      </div>
    );
  }
}
