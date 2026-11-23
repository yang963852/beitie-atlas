import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RootErrorBoundary } from '../src/components/RootErrorBoundary';

function Exploding(): never {
  throw new Error('corpus exploded');
}

describe('root error boundary', () => {
  afterEach(() => {
    document.documentElement.lang = 'zh-Hans';
    vi.restoreAllMocks();
  });

  it('keeps a readable fallback instead of a blank page', () => {
    // React logs the caught render error; the test asserts the fallback, not the log.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    document.documentElement.lang = 'zh-Hans';

    render(
      <RootErrorBoundary>
        <Exploding />
      </RootErrorBoundary>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('页面未能显示');
    expect(alert).toHaveTextContent('corpus exploded');
    expect(screen.getByRole('link', { name: '返回图录' })).toHaveAttribute('href', '#/');
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
    expect(screen.getByRole('link', { name: 'Back to the catalogue' })).toHaveAttribute('href', '#/');
  });
});
