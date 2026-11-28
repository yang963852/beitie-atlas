import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';

/**
 * The About and Join in pages are static routes: they must survive a shared
 * link, keep both languages readable, and describe the submission channel as
 * it actually behaves rather than as an in-site form.
 */
beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', window.location.pathname);
});

describe('About and Join in', () => {
  it('opens a shared About link in Chinese with the philosophy link', () => {
    window.history.replaceState(null, '', '#/about');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: '关于碑帖之间' })).toBeInTheDocument();
    expect(screen.getByText('人人为我，我为人人。')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '阅读完整项目理念' }).getAttribute('href'))
      .toContain('docs/PROJECT.md');
    expect(screen.getByRole('link', { name: '共建' }).getAttribute('href')).toBe('#/join');
  });

  it('switches About to English without leaving the shared link', () => {
    window.history.replaceState(null, '', '#/about');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(screen.getByRole('heading', { level: 1, name: 'About Between Steles' })).toBeInTheDocument();
    expect(screen.getByText(/Everyone contributes for the benefit of others/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read the full project philosophy' }).getAttribute('href'))
      .toContain('docs/PROJECT.en.md');
    expect(window.location.hash).toBe('#/about');
  });

  it('states what the submission channels can do on Join in', () => {
    window.history.replaceState(null, '', '#/join');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: '参与共建' })).toBeInTheDocument();
    expect(screen.getByText(/页面本身不保存、不发送内容/)).toBeInTheDocument();
    expect(screen.getByText(/没有站内投稿后台/)).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links.some((link) => link.getAttribute('href')?.includes('template=knowledge.yml')))
      .toBe(true);
    expect(links.some((link) => link.getAttribute('href') === '#/about')).toBe(true);
  });

  it('keeps the desk opening and adds discoverable About / Join in links', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /案头所临，如今藏在何处[\s\S]*打开访碑图/ }))
      .toBeInTheDocument();
    expect(screen.getByRole('link', { name: '关于' }).getAttribute('href')).toBe('#/about');
    expect(screen.getByRole('link', { name: '共建' }).getAttribute('href')).toBe('#/join');
    expect(screen.getByText('从案头一帖，走向更广阔的书法世界。')).toBeInTheDocument();
    expect(screen.getByText('人人为我，我为人人。')).toBeInTheDocument();
  });

  it('returns to the desk from a shared page via the hash route', () => {
    window.history.replaceState(null, '', '#/join');
    render(<App />);

    act(() => {
      window.history.replaceState(null, '', '#');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(screen.getByRole('link', { name: /案头所临，如今藏在何处[\s\S]*打开访碑图/ }))
      .toBeInTheDocument();
  });
});
