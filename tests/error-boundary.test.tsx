import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RootErrorBoundary } from '../src/components/RootErrorBoundary';

import App from '../src/App';
import { warmRoutes } from './warm-routes';

beforeAll(async () => {
  await warmRoutes(['timeline']);
}, 120000);

function Exploding(): never {
  throw new Error('corpus exploded');
}

describe('root error boundary', () => {
  afterEach(() => {
    document.documentElement.lang = 'zh-Hans';
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  it('recovers from a broken record and opens a different work from the timeline', async () => {
    // React logs the caught render error; the test asserts the fallback, not the log.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    document.documentElement.lang = 'zh-Hans';

    window.history.replaceState(null, '', '#/object/broken');
    function Reader() {
      return window.location.hash === '#/object/broken' ? <Exploding /> : <App />;
    }

    render(
      <RootErrorBoundary>
        <Reader />
      </RootErrorBoundary>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('页面未能显示');
    expect(alert).toHaveTextContent('corpus exploded');
    fireEvent.click(screen.getByRole('link', { name: '返回图录' }));
    expect(window.location.hash).toBe('#catalogue');
    expect(alert).not.toBeInTheDocument();
    // jsdom lacks the browser dialog methods used by the work reader.
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = createElement(tag, options);
      if (element instanceof HTMLDialogElement) {
        element.showModal = () => { element.open = true; };
        element.close = () => { element.open = false; };
      }
      return element;
    });
    const card = document.querySelector<HTMLAnchorElement>('.atlas-card[href="#/folio/lanting"]');
    expect(card).toBeVisible();
    fireEvent.click(card!);
    expect(await screen.findByRole('dialog')).toHaveTextContent('兰亭');
  });

  it('takes its copy from the declared language, not a second hard-coded string', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    document.documentElement.lang = 'en';

    render(
      <RootErrorBoundary>
        <Exploding />
      </RootErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('This page could not be displayed');
    expect(screen.getByRole('link', { name: 'Back to the catalogue' })).toHaveAttribute('href', '#catalogue');
  });
});
