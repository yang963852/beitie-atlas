import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { getDataset } from '../src/domain/data';

const recordCount = getDataset().objects.length;

function renderApp() {
  return render(<App />);
}

function resultsList() {
  return screen.getByRole('list', { name: /记录/ });
}

/** Models browser Back: the URL changes, then a single hashchange is fired. */
function goBackTo(hash: string) {
  act(() => {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

beforeEach(() => {
  window.history.replaceState(null, '', window.location.pathname);
  window.localStorage.clear();
});

describe('application shell', () => {
  it('waits for paper activation and the ink transition before entering the records', () => {
    renderApp();
    const paper = screen.getByRole('link', { name: '打开碑帖图录' });
    expect(paper.textContent).toBe('案头所临，如今藏在何处');
    expect(document.querySelector('.desk__ink')).toBeNull();
    vi.useFakeTimers();
    try {
      fireEvent.click(paper);
      expect(document.querySelector('.desk__ink')).toHaveStyle({ left: '50%', top: '50%' });
      expect(window.location.hash).toBe('');
      act(() => vi.runAllTimers());
      expect(document.activeElement).toBe(document.getElementById('catalogue'));
      expect(window.location.hash).toBe('#catalogue');
    } finally {
      vi.useRealTimers();
    }
  });

  it('opens the depicted witness from the desk credit', () => {
    renderApp();
    fireEvent.click(screen.getByRole('link', { name: /帖影/ }));
    expect(window.location.hash).toBe('#/object/witness-lanting');
    expect(document.activeElement).toBe(document.getElementById('detail'));
    expect(within(screen.getByRole('article')).getByRole('heading', {name: /神龙本/})).toBeVisible();
  });

  it('lands an object permalink on its detail instead of the cover', () => {
    window.history.replaceState(null, '', '#/object/witness-jizhi');
    renderApp();
    expect(document.activeElement).toBe(document.getElementById('detail'));
    expect(within(screen.getByRole('article')).getByText(/一处写至元壬午/)).toBeInTheDocument();
  });

  it('lists every object record and opens the first one', () => {
    renderApp();

    const links = within(resultsList()).getAllByRole('link');
    expect(links).toHaveLength(recordCount);
    expect(within(resultsList()).getByText('颜勤礼碑（原石）')).toBeInTheDocument();
    expect(within(resultsList()).getByText('颜勤礼碑（民国拓本）')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: '秦石鼓（原石十件）' })).toBeInTheDocument();
    expect(within(resultsList()).getByText('玄秘塔碑（原石）')).toBeInTheDocument();
  });

  it('groups the list by period and keeps each row to a name and a place', () => {
    renderApp();
    const list = resultsList();
    const periods = within(list).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent?.trim().split(/\s*\d/)[0]);
    expect(periods).toEqual(['先秦', '秦', '西汉', '东汉', '三国', '东晋', '南北朝', '隋', '唐', '北宋', '元', '明', '清']);

    expect(within(list).getByRole('heading', { name: /东汉/ })).toBeInTheDocument();
    expect(within(list).getByRole('heading', { name: /南北朝/ })).toBeInTheDocument();
    expect(within(list).getByRole('heading', { name: /^唐/ })).toBeInTheDocument();

    // The owner asked for one name and one place per row: type, period,
    // attribution and dates belong to the record pane, one click away.
    const row = within(list).getByText('颜勤礼碑（原石）').closest('a');
    expect(row?.textContent).toBe('颜勤礼碑（原石）西安碑林博物馆');
    expect(row?.textContent).not.toContain('Yan Qinli');
    expect(row?.querySelector('.result__author')).toBeNull();
  });

  it('shows the period and each credited hand in the detail view', () => {
    renderApp();

    fireEvent.click(within(resultsList()).getByText('玄秘塔碑（原石）'));

    const detail = screen.getByRole('article');
    expect(within(detail).getByText('朝代')).toBeInTheDocument();
    expect(detail.querySelector('.facts')?.textContent).toContain('唐');
    expect(within(detail).getByText('裴休')).toBeInTheDocument();
    expect(within(detail).getAllByText('柳公权')).toHaveLength(2);
    expect(within(detail).getByText('邵建和、邵建初')).toBeInTheDocument();
  });

  it('shows work-level and place-level editorial notes and marks their language', () => {
    renderApp();

    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（原石）'));

    const detail = screen.getByRole('article');
    // These notes live on the work and on the place, not on the object; none of
    // them used to be rendered anywhere.
    const workNote = within(detail).getByText(/The English title is a project translation/);
    expect(workNote).toHaveAttribute('lang', 'en');

    const placeNote = within(detail).getByText(/gives no street address or coordinates/);
    expect(placeNote).toHaveAttribute('lang', 'en');

    // Notes are grouped by the record they describe, so a gap stated at two
    // levels reads as two records rather than as a duplicate.
    const scopes = Array.from(detail.querySelectorAll('.notes__scope')).map(
      (node) => node.textContent,
    );
    expect(scopes).toEqual(['本条实物', '所属作品', '收藏地点']);
  });

  it('shows the rubbing’s own catalogue number and no copied provenance', () => {
    renderApp();

    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（民国拓本）'));

    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();
    expect(screen.getByText('新00045406')).toBeInTheDocument();
    expect(screen.getByText(/所引资料尚未记下这件实物的递藏经过/)).toBeInTheDocument();
    expect(screen.queryByText(/在地下数米处发现此石/)).not.toBeInTheDocument();
    expect(window.location.hash).toBe('#/object/dpm-rubbing-xin00045406');
  });

  it('filters by Chinese, English, and collection name', () => {
    renderApp();
    const search = screen.getByLabelText(/搜索记录/);

    fireEvent.change(search, { target: { value: '欧阳询' } });
    expect(within(resultsList()).getAllByRole('link').length).toBeGreaterThan(0);
    expect(within(resultsList()).queryByText('秦石鼓（原石十件）')).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: '故宫' } });
    const palaceRows = within(resultsList()).getAllByRole('link');
    // Every hit is a Palace Museum holding; the count grows with the corpus, so
    // the invariant is the place, not a fixed number.
    expect(palaceRows.length).toBeGreaterThanOrEqual(3);
    expect(palaceRows.every((row) => row.textContent?.includes('故宫博物院'))).toBe(true);
    expect(within(resultsList()).getByText('颜勤礼碑（民国拓本）')).toBeInTheDocument();

    fireEvent.change(search, { target: { value: '00045406' } });
    expect(within(resultsList()).getAllByRole('link')).toHaveLength(1);

    fireEvent.change(search, { target: { value: 'no such record' } });
    expect(screen.getByText(/没有符合这个条件的记录/)).toBeInTheDocument();
  });

  it('lets a user open a mapped object without a configured basemap', () => {
    renderApp();

    const overview = screen.getByRole('group', { name: /经纬度点位示意/ });
    fireEvent.click(within(overview).getByRole('button', { name: /晋祠博物馆/ }));
    const selection = screen.getByRole('group', { name: '选中的地点' });
    fireEvent.click(within(selection).getByRole('button', { name: /晋祠之铭并序（清乾隆摹刻）/ }));
    expect(screen.getByRole('heading', { name: '晋祠之铭并序（清乾隆摹刻）' })).toBeInTheDocument();
    expect(screen.getAllByText(/未核实（二手来源）/).length).toBeGreaterThan(0);
  });

  it('opens a record from a hash link', () => {
    window.history.replaceState(null, '', '#/object/dpm-rubbing-xin00045406');
    renderApp();

    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();
    expect(screen.getByText('新00045406')).toBeInTheDocument();
  });

  it('filters map locations and their objects to surviving originals without changing the record list', () => {
    renderApp();
    const map = screen.getByRole('region', { name: '地图' });
    const filter = within(map).getByRole('checkbox', { name: '仅显示存世原件' });
    fireEvent.click(filter);

    fireEvent.click(within(map).getByRole('button', { name: /^故宫博物院 ·/ }));
    const palaceSelection = within(map).getByRole('group', { name: '选中的地点' });
    expect(within(palaceSelection).getByRole('button', { name: /秦石鼓/ })).toBeInTheDocument();
    expect(within(palaceSelection).queryByRole('button', { name: /故宫明拓册/ })).not.toBeInTheDocument();
    fireEvent.click(within(map).getByRole('button', { name: /^晋祠博物馆 ·/ }));
    const selection = within(map).getByRole('group', { name: '选中的地点' });
    expect(within(selection).getAllByRole('button')).toHaveLength(1);
    expect(within(selection).getByRole('button').textContent).not.toContain('清乾隆摹刻');
    expect(within(resultsList()).getAllByRole('link')).toHaveLength(recordCount);

    fireEvent.click(filter);
    fireEvent.click(within(map).getByRole('button', { name: /^故宫博物院 ·/ }));
    expect(within(within(map).getByRole('group', { name: '选中的地点' }))
      .getByRole('button', { name: /故宫明拓册/ })).toBeInTheDocument();
  });

  it('opens the record view for a shared link and returns to the list on Back', () => {
    window.history.replaceState(null, '', '#/object/yan-qinli-original-stele');
    const { container } = renderApp();
    const workspace = container.querySelector('.workspace');

    expect(workspace).toHaveAttribute('data-mobile-view', 'detail');

    fireEvent.click(screen.getByRole('button', { name: /返回记录/ }));

    expect(workspace).toHaveAttribute('data-mobile-view', 'list');
    expect(window.location.hash).toBe('#/object/yan-qinli-original-stele');
  });

  it('switches the mobile pane without losing the selection', () => {
    const { container } = renderApp();
    const workspace = container.querySelector('.workspace');

    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（民国拓本）'));
    fireEvent.click(screen.getByRole('button', { name: /返回记录/ }));

    fireEvent.click(screen.getByRole('button', { name: '地图' }));
    expect(workspace).toHaveAttribute('data-mobile-view', 'map');

    fireEvent.click(screen.getByRole('button', { name: '列表' }));
    expect(workspace).toHaveAttribute('data-mobile-view', 'list');

    fireEvent.change(screen.getByLabelText(/搜索记录/), { target: { value: '故宫' } });
    expect(within(resultsList()).getByText('颜勤礼碑（民国拓本）')).toBeInTheDocument();
  });

  it('keeps the map open after showing the default record on the map', async () => {
    const { container } = renderApp();
    const workspace = container.querySelector('.workspace');
    fireEvent.click(screen.getByRole('link', { name: '实物详情' }));
    expect(window.location.hash).toBe('');

    fireEvent.click(within(screen.getByRole('article')).getByRole('button', { name: '在地图上查看' }));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(window.location.hash).toBe('#/object/stone-drums-original-set');
    expect(workspace).toHaveAttribute('data-mobile-view', 'map');
    expect(screen.getByRole('button', { name: /^故宫博物院 ·/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters the list, the map panel, and the detail together', () => {
    renderApp();
    const search = screen.getByLabelText(/搜索记录/);

    fireEvent.click(within(resultsList()).getByText('石门颂（摩崖）'));
    fireEvent.change(search, { target: { value: '00045406' } });

    expect(within(resultsList()).getAllByRole('link')).toHaveLength(1);
    expect(screen.getByText(`1 / ${recordCount} 条`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();

    const mapPanel = screen.getByRole('region', { name: '地图' });
    expect(within(mapPanel).queryByText('西安碑林博物馆')).not.toBeInTheDocument();
    expect(within(mapPanel).getAllByText('故宫博物院').length).toBeGreaterThan(0);
    expect(screen.getByText(/^地点列表/)).toHaveTextContent('1');
  });

  it('filters by the represented work when both surviving witnesses are rubbings', () => {
    renderApp();
    const group = screen.getByRole('group', { name: '按作品类别筛选' });
    fireEvent.click(within(group).getByRole('button', { name: '帖' }));
    expect(within(resultsList()).getByText('《墨池堂选帖》（明拓本）')).toBeInTheDocument();
    expect(within(resultsList()).queryByText('玄秘塔碑（故宫明初拓册）')).toBeNull();
    fireEvent.change(screen.getByLabelText(/搜索记录/), { target: { value: '新00072378' } });
    expect(screen.getByText(/^地点列表/)).toHaveTextContent('0');
    fireEvent.click(within(group).getByRole('button', { name: '碑' }));
    expect(within(resultsList()).getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: '玄秘塔碑（故宫明初拓册）' })).toBeInTheDocument();
    expect(screen.getByText(/^地点列表/)).toHaveTextContent('1');
  });

  it('shows an empty selection and no places when nothing matches', () => {
    renderApp();
    const search = screen.getByLabelText(/搜索记录/);

    fireEvent.change(search, { target: { value: 'no such record' } });

    expect(screen.getByText(/没有符合这个条件的记录/)).toBeInTheDocument();
    expect(screen.getByText('请选择一件实物')).toBeInTheDocument();
    expect(screen.queryByText('西安碑林博物馆')).not.toBeInTheDocument();
    expect(screen.getByText(/^地点列表/)).toHaveTextContent('0');
  });

  it('keeps the selected record when a section link is used', () => {
    renderApp();
    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（民国拓本）'));
    expect(window.location.hash).toBe('#/object/dpm-rubbing-xin00045406');

    fireEvent.click(screen.getByRole('link', { name: '地图' }));

    expect(window.location.hash).toBe('#/object/dpm-rubbing-xin00045406');
    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();
    expect(document.activeElement).toBe(document.getElementById('map'));
  });

  it('does not let a section hash erase the selected record', () => {
    renderApp();
    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（民国拓本）'));

    goBackTo('#map');

    expect(window.location.hash).toBe('#map');
    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();
  });

  it('restores the previous selection when the user goes back', () => {
    renderApp();
    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（民国拓本）'));
    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();

    goBackTo('#');

    expect(screen.getByRole('heading', { name: '秦石鼓（原石十件）' })).toBeInTheDocument();
  });

  it('switches the whole interface to English and keeps the selection', () => {
    renderApp();
    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（民国拓本）'));

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(screen.getByRole('list', { name: /Records/ })).toBeInTheDocument();
    expect(screen.getByText(`${recordCount} of ${recordCount}`)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Map' })).toBeInTheDocument();
    expect(screen.getByText(/Location overview · basemap unavailable/)).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: /Records/ })).getByText('Yan Qinli Stele, Republican-era rubbing')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();
    expect(screen.getByText(/No custody events are recorded for this object/)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');

    fireEvent.click(screen.getByRole('button', { name: '中文' }));
    expect(screen.getByRole('region', { name: '地图' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('zh-Hans');
  });

  it('names the object type of every record held at a selected point', () => {
    renderApp();
    const overview = screen.getByRole('group', { name: /经纬度点位示意/ });
    fireEvent.click(within(overview).getByRole('button', { name: /晋祠博物馆/ }));

    const selection = screen.getByRole('group', { name: '选中的地点' });
    // The same place holds a Tang stone and a Qianlong recutting; a reader has
    // to be able to tell them apart before opening either.
    expect(within(selection).getByText('原石')).toBeInTheDocument();
    expect(within(selection).getByText('翻刻')).toBeInTheDocument();
    expect(within(selection).getByRole('button', { name: /清乾隆摹刻/ })).toBeInTheDocument();
  });

  it('shows the recorded work background, in the language it was written in', () => {
    renderApp();
    fireEvent.click(within(resultsList()).getByText('九成宫醴泉铭（原石）'));

    const detail = screen.getByRole('article');
    expect(within(detail).getByRole('heading', { name: '作品背景' })).toBeInTheDocument();
    expect(within(detail).getByText(/魏徵在九成宫撰铭/)).toHaveAttribute('lang', 'zh-Hans');
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    const background = within(detail).getByText(/Wei Zheng’s remonstrance/);
    expect(background).toHaveAttribute('lang', 'en');
    expect(within(detail).queryByText(/魏徵在九成宫撰铭/)).toBeNull();
  });

  it('composes a contribution with its caveat and a prefilled public issue link', () => {
    renderApp();
    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（原石）'));
    fireEvent.click(screen.getByRole('button', { name: '补充或纠正这条记录' }));

    const preview = screen.getByLabelText('将要提交的文字') as HTMLTextAreaElement;
    expect(preview.value).toContain('颜勤礼碑（原石）');
    expect(preview.value).toContain('#/object/yan-qinli-original-stele');
    expect(preview.value).toContain('不是已核实的结论');

    // Nothing is submitted until the reader has written something.
    const blocked = screen.getByRole('button', { name: '打开提交页' });
    expect(blocked).toHaveAttribute('aria-disabled', 'true');

    fireEvent.change(screen.getByLabelText('你掌握的信息'), {
      target: { value: '民国拓本上有藏印一方。' },
    });

    const link = screen.getByRole('link', { name: '打开提交页' });
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain('https://github.com/yang963852/beitie-atlas/issues/new');
    expect(decodeURIComponent(href.replace(/\+/g, ' '))).toContain('民国拓本上有藏印一方。');

    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: '提交资料' }));
    expect(screen.getByLabelText('你掌握的信息')).toHaveValue('');
    expect(screen.getByLabelText('将要提交的文字')).not.toHaveValue(expect.stringContaining('颜勤礼碑'));
  });
});
