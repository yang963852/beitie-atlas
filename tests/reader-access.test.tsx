import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { warmRoutes } from './warm-routes';

/**
 * Reader-facing access defects found by an external evaluation: links that
 * trap the browser's own new-tab gestures, a desk control whose accessible
 * name hid its visible words, a missing map explanation, an object view with no
 * h1, a Chinese full stop in the English interface, and Chinese claims read
 * without a language.
 */

function resultsList() {
  return screen.getByRole('list', { name: /记录/ });
}

/** The workspace and library routes are lazy after the entry-bundle split;
 * warm them once so each assertion below still runs against a mounted view. */
beforeAll(async () => {
  await warmRoutes(['workspace', 'library']);
}, 120000);

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', window.location.pathname);
});

afterEach(() => vi.restoreAllMocks());

describe('record links', () => {
  it('leaves a modifier-click to the browser but still selects on a plain click', () => {
    window.history.replaceState(null, '', '#results');
    render(<App />);
    const link = within(resultsList()).getAllByRole('link')[0];
    const href = link.getAttribute('href');
    expect(href).toMatch(/^#\/object\//);

    const pushState = vi.spyOn(window.history, 'pushState');
    const modified = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    act(() => {
      link.dispatchEvent(modified);
    });
    // Nothing cancelled the browser's own new-tab action, and the app did not
    // re-route the current page behind the reader's back.
    expect(modified.defaultPrevented).toBe(false);
    expect(pushState).not.toHaveBeenCalled();

    act(() => {
      window.history.replaceState(null, '', '#results');
    });
    act(() => {
      fireEvent.click(link);
    });
    expect(pushState).toHaveBeenCalledWith(null, '', href);
  });
});

describe('opening desk', () => {
  it('keeps the visible words inside the link accessible name', () => {
    render(<App />);
    const paper = screen.getByRole('link', { name: /案头所临，如今藏在何处[\s\S]*打开访碑图/ });
    expect(paper.querySelector('.desk__words')?.textContent).toBe('案头所临，如今藏在何处');
  });
});

describe('map fallback', () => {
  it('explains that the map is not enabled when no key was built in', () => {
    window.history.replaceState(null, '', '#results');
    render(<App />);
    expect(screen.getByText('地图未启用')).toBeInTheDocument();
    expect(screen.getByText(/配置天地图密钥后即显示真实底图/)).toBeInTheDocument();
  });
});

describe('object landing view', () => {
  it('has exactly one h1 carrying the object title', () => {
    window.history.replaceState(null, '', '#/object/witness-jizhi');
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('祭侄文稿');
  });
});

describe('witness heading punctuation', () => {
  it('ends with an English full stop in the English interface', () => {
    localStorage.setItem('beitie.locale', 'en');
    window.history.replaceState(null, '', '#/work/yan-qinli-bei');
    render(<App />);
    const hint = screen.getByText('Choose a witness. Each witness keeps its own record.');
    expect(hint.textContent).not.toMatch(/。/);
  });

  it('keeps the Chinese full stop in the Chinese interface', () => {
    window.history.replaceState(null, '', '#/work/yan-qinli-bei');
    render(<App />);
    expect(screen.getByText('选择一件实物。每件实物只显示自己的履历。')).toBeInTheDocument();
  });
});

describe('claims language', () => {
  it('marks each claim sentence with the language it is written in', () => {
    localStorage.setItem('beitie.locale', 'en');
    window.history.replaceState(null, '', '#/object/witness-jizhi');
    render(<App />);
    const claims = document.querySelector('.claims');
    expect(claims?.querySelector('strong')?.getAttribute('lang')).toBe('zh-Hans');
    expect(claims?.querySelector('.section__note')?.getAttribute('lang')).toBe('en');
  });
});
