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
    expect(screen.getByRole('heading', { name: '传世实物' })).toBeInTheDocument();
    expect(screen.getByText('本项目尚未收录可辨实物。')).toBeVisible();
    expect(screen.getByText(/当代课程书单/)).toBeVisible();
  });

  it('connects a person and both physical witnesses through the authored guide', () => {
    window.history.replaceState(null, '', '#/person/yan-zhenqing');
    render(<App />);
    expect(screen.getAllByRole('link', { name: /颜勤礼碑/ }).some(link => link.getAttribute('href') === '#/work/yan-qinli-bei')).toBe(true);
    navigate('#/work/yan-qinli-bei');
    const witnesses = screen.getByRole('heading', { name: '传世实物' }).closest('section')!;
    fireEvent.click(within(witnesses).getByRole('button', { name: /原石/ }));
    expect(within(witnesses).getByRole('link', { name: '在地图与完整记录中查看' })).toHaveAttribute('href', '#/object/yan-qinli-original-stele');
    fireEvent.click(within(witnesses).getByRole('button', { name: /民国拓本/ }));
    expect(within(witnesses).getByRole('link', { name: '在地图与完整记录中查看' })).toHaveAttribute('href', '#/object/dpm-rubbing-xin00045406');
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
    'https://github.com/yang963852/beitie-atlas/edit/main/knowledge/works/langya-keshi.md');
});

it('keeps the recorded polity visible in the period shelf and search results', () => {
  window.history.replaceState(null, '', '#/library');
  render(<App />);
  const row = () => screen.getByRole('link', { name: '好太王碑' }).closest('li');
  expect(row()).toHaveTextContent('东晋 · 高句丽');
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '好太王碑' } });
  expect(row()).toHaveTextContent('东晋 · 高句丽');
});

it('prints a provenance date once when the recorded wording repeats the label', () => {
  window.history.replaceState(null, '', '#/work/yan-qinli-bei');
  render(<App />);
  const timeline = document.querySelector('.timeline');
  expect(timeline?.textContent?.match(/1922年10月/g)?.length).toBe(1);
  expect(timeline?.textContent).toContain('1928年三四月间');
});

it('shows no workflow status on a published work or witness', () => {
  window.history.replaceState(null, '', '#/work/yan-qinli-bei');
  render(<App />);
  const entry = screen.getByRole('article');
  expect(entry.textContent).not.toContain('已审核');
  expect(entry.textContent).not.toContain('草稿');
  expect(entry.textContent).not.toContain('审核说明');
  navigate('#/object/yan-qinli-original-stele');
  const detail = screen.getByRole('article');
  expect(detail.textContent).not.toContain('已审核');
  expect(detail.textContent).not.toContain('草稿');
  expect(detail.textContent).not.toContain('审核说明');
});

it('names the 1.1 edition on the library page', () => {
  window.history.replaceState(null, '', '#/library');
  render(<App />);
  const colophon = document.querySelector('.reading-colophon');
  expect(colophon?.textContent).toContain('1.1');
});
