import { readFileSync } from 'node:fs';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

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
  it('finds works in their catalogue, including a work without a located object', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '沈尹默' } });
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

it('names the current edition on the library page', () => {
  window.history.replaceState(null, '', '#/library');
  render(<App />);
  const colophon = document.querySelector('.reading-colophon');
  expect(colophon?.textContent).toContain(version);
});

describe('reading notes index', () => {
  it('groups all notes into the three reading categories in editorial order', () => {
    window.history.replaceState(null, '', '#/library/notes');
    const { container } = render(<App />);
    expect(container.querySelectorAll('.note-card')).toHaveLength(16);
    const titles = Array.from(container.querySelectorAll('.note-card h3'), (heading) => heading.textContent);
    expect(titles.slice(0, 3)).toEqual(['先秦——青铜、石鼓与竹简', '秦汉——统一文字与隶书登场', '魏晋——名家、信札与复制']);
    expect(titles.slice(8, 10)).toEqual(['隶变——从青铜到汉碑', '楷化——从钟繇到唐楷']);
    expect(titles.at(-1)).toBe('从一个「故」字读《颜勤礼碑》');
    expect(titles.every((title) => !/^\d+｜/.test(title ?? ''))).toBe(true);
    expect(screen.getByRole('button', { name: /时代专题/ })).toHaveTextContent('8');
    expect(screen.getByRole('button', { name: /阅读路径/ })).toHaveTextContent('6');
    expect(screen.getByRole('button', { name: /单篇细读/ })).toHaveTextContent('2');
  });

  it('combines category and period filters and clears them from the empty state', () => {
    window.history.replaceState(null, '', '#/library/notes');
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /时代专题/ }));
    expect(container.querySelectorAll('.note-card')).toHaveLength(8);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'song' } });
    expect(container.querySelectorAll('.note-card')).toHaveLength(1);
    expect(screen.getByRole('link', { name: '宋代——刻帖、墨迹与士人书' })).toBeVisible();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '不存在的笔记' } });
    expect(screen.getByText('没有符合条件的笔记。')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '查看全部笔记' }));
    expect(container.querySelectorAll('.note-card')).toHaveLength(16);
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveValue('all');
  });

  it('searches linked works and calligraphers without mixing other library entries', () => {
    window.history.replaceState(null, '', '#/library/notes');
    const { container } = render(<App />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '沈尹默' } });
    expect(container.querySelectorAll('.note-card')).toHaveLength(2);
    expect(screen.getByRole('link', { name: '帖学——刻帖的谱系' })).toHaveAttribute('href', '#/note/path-05-modelbook');
    expect(screen.getByRole('link', { name: '清近代——碑学与日常书写' })).toHaveAttribute('href', '#/note/essay-08-qing-modern');
    expect(container.querySelector('a[href^="#/work/"]')).toBeNull();
    expect(container.querySelector('a[href^="#/person/"]')).toBeNull();
  });

  it('keeps cross-period reading paths out of a single-period filter', () => {
    window.history.replaceState(null, '', '#/library/notes');
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /阅读路径/ }));
    expect(container.querySelectorAll('.note-card')).toHaveLength(6);
    expect(screen.getByRole('combobox').querySelectorAll('option')).toHaveLength(1);
  });

  it('switches note labels, titles and excerpts to English', () => {
    window.history.replaceState(null, '', '#/library/notes');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reading notes');
    expect(screen.getByRole('link', { name: 'Pre-Qin — Bronzes, Stone Drums and Bamboo Slips' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Close readings/ })).toHaveTextContent('2');
    expect(screen.getAllByText('1 work')).toHaveLength(2);
  });
});

it('keeps work search inside the work catalogue', () => {
  window.history.replaceState(null, '', '#/library');
  const { container } = render(<App />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '兰亭' } });
  expect(screen.getByRole('link', { name: '兰亭序' })).toBeVisible();
  expect(container.querySelector('a[href^="#/note/"]')).toBeNull();
});

it('finds people inside the calligrapher catalogue', () => {
  window.history.replaceState(null, '', '#/library/people');
  render(<App />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '沈尹默' } });
  expect(screen.getByRole('link', { name: '沈尹默' })).toHaveAttribute('href', '#/person/shen-yinmo');
});

it('groups calligraphers by their recorded dynasty', () => {
  window.history.replaceState(null, '', '#/library/people');
  render(<App />);
  const tang = Array.from(document.querySelectorAll('.library-shelf')).find(
    (shelf) => shelf.querySelector('h2')?.textContent?.startsWith('唐'),
  ) as HTMLElement | undefined;
  expect(tang).toBeTruthy();
  expect(within(tang!).getByRole('link', { name: '颜真卿' })).toBeInTheDocument();
});
