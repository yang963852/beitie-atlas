import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';

function navigate(hash: string) {
  act(() => {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '#/library');
});

describe('reading routes', () => {
  it('finds people and works across the catalogue, including a work without a located object', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '沈尹默' } });
    expect(screen.getByRole('link', { name: '沈尹默' })).toHaveAttribute('href', '#/person/shen-yinmo');
    expect(screen.getByRole('link', { name: '甲种本大楷习字帖' })).toHaveAttribute('href', '#/work/shen-yinmo-dakai-jia');
    navigate('#/work/shen-yinmo-dakai-jia');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('甲种本大楷习字帖');
    expect(screen.queryByRole('heading', { name: '传世实物' })).not.toBeInTheDocument();
    expect(screen.getByText(/当代课程书单/)).toBeVisible();
  });

  it('connects a person and both physical witnesses through the authored guide', () => {
    window.history.replaceState(null, '', '#/person/yan-zhenqing');
    render(<App />);
    expect(screen.getAllByRole('link', { name: /颜勤礼碑/ }).some(link => link.getAttribute('href') === '#/work/yan-qinli-bei')).toBe(true);
    navigate('#/work/yan-qinli-bei');
    const witnesses = screen.getByRole('heading', { name: '传世实物' }).closest('section')!;
    expect(within(witnesses).getByRole('link', { name: /原石/ })).toHaveAttribute('href', '#/object/yan-qinli-original-stele');
    expect(within(witnesses).getByRole('link', { name: /民国拓本/ })).toHaveAttribute('href', '#/object/dpm-rubbing-xin00045406');
    navigate('#/object/dpm-rubbing-xin00045406');
    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeVisible();
    const workLine = within(screen.getByRole('article')).getAllByRole('link', { name: '颜勤礼碑' });
    expect(workLine.some(link => link.getAttribute('href') === '#/work/yan-qinli-bei')).toBe(true);
  });

  it('shows the same sourced relationship from both endpoints', () => {
    window.history.replaceState(null, '', '#/person/shen-yinmo');
    render(<App />);
    for (const [id, other] of [['shen-yinmo', 'zhao-puchu'], ['zhao-puchu', 'shen-yinmo']]) {
      navigate('#/person/' + id);
      const section = screen.getByRole('heading', { name: '人物往来' }).closest('section')!;
      expect(within(section).getAllByRole('link').some(link => link.getAttribute('href') === '#/person/' + other)).toBe(true);
      expect(section.textContent).toContain('诗词唱和');
      expect(section.querySelector('a[href*="shanghaimuseum"]')).toBeTruthy();
    }
  });
});

it('edits the authored document or the canonical work record according to its source', () => {
  render(<App />);
  navigate('#/work/yan-qinli-bei');
  expect(screen.getByRole('link', {name: '编辑条目并提交'})).toHaveAttribute('href',
    'https://github.com/yang963852/beitie-atlas/edit/main/knowledge/works/yan-qinli-bei.md');
  navigate('#/work/langya-keshi');
  expect(screen.getByRole('link', {name: '编辑条目并提交'})).toHaveAttribute('href',
    'https://github.com/yang963852/beitie-atlas/edit/main/data/works/langya-keshi.json');
});
