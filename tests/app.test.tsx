import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
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
  it('lists every object record and opens the first one', () => {
    renderApp();

    const links = within(resultsList()).getAllByRole('link');
    expect(links).toHaveLength(recordCount);
    expect(within(resultsList()).getByText('颜勤礼碑（原石）')).toBeInTheDocument();
    expect(within(resultsList()).getByText('颜勤礼碑（民国拓本）')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: '峄山刻石（北宋长安本）' })).toBeInTheDocument();
    expect(within(resultsList()).getByText('玄秘塔碑（原石）')).toBeInTheDocument();
  });

  it('groups the list by period and names the credited hands', () => {
    renderApp();
    const list = resultsList();
    const periods = within(list).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent?.trim().split(/\s*\d/)[0]);
    expect(periods).toEqual(['秦', '西汉', '东汉', '三国', '南北朝', '隋', '唐', '北宋', '元', '明', '清', '民国']);

    expect(within(list).getByRole('heading', { name: /东汉/ })).toBeInTheDocument();
    expect(within(list).getByRole('heading', { name: /南北朝/ })).toBeInTheDocument();
    expect(within(list).getByRole('heading', { name: /^唐/ })).toBeInTheDocument();

    // A row says who wrote, brushed, and cut the stone, not only where it is.
    expect(within(list).getByText('撰 岑勋 · 书 颜真卿 · 刻 史华')).toBeInTheDocument();
    expect(within(list).getAllByText('未署名').length).toBeGreaterThan(0);
  });

  it('shows the period and each credited hand in the detail view', () => {
    renderApp();

    fireEvent.click(within(resultsList()).getByText('玄秘塔碑（原石）'));

    const detail = screen.getByRole('article');
    expect(within(detail).getByText('朝代')).toBeInTheDocument();
    expect(detail.querySelector('.facts')?.textContent).toContain('唐');
    expect(within(detail).getByText('裴休')).toBeInTheDocument();
    expect(within(detail).getByText('柳公权')).toBeInTheDocument();
    expect(within(detail).getByText('邵建和、邵建初')).toBeInTheDocument();
  });

  it('shows the rubbing’s own catalogue number and no copied provenance', () => {
    renderApp();

    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（民国拓本）'));

    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();
    expect(screen.getByText('新00045406')).toBeInTheDocument();
    expect(screen.getByText(/本条记录没有保管事件的记载/)).toBeInTheDocument();
    expect(screen.queryByText(/在地下数米处发现此石/)).not.toBeInTheDocument();
    expect(window.location.hash).toBe('#/object/dpm-rubbing-xin00045406');
  });

  it('filters by Chinese, English, and collection name', () => {
    renderApp();
    const search = screen.getByLabelText(/搜索记录/);

    fireEvent.change(search, { target: { value: '故宫' } });
    expect(within(resultsList()).getAllByRole('link')).toHaveLength(3);
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
    fireEvent.click(within(selection).getByRole('button', { name: '晋祠之铭并序（清乾隆摹刻）' }));
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

    expect(within(map).queryByRole('button', { name: /^故宫博物院 ·/ })).not.toBeInTheDocument();
    fireEvent.click(within(map).getByRole('button', { name: /^晋祠博物馆 ·/ }));
    const selection = within(map).getByRole('group', { name: '选中的地点' });
    expect(within(selection).getAllByRole('button')).toHaveLength(1);
    expect(within(selection).getByRole('button').textContent).not.toContain('清乾隆摹刻');
    expect(within(resultsList()).getAllByRole('link')).toHaveLength(recordCount);

    fireEvent.click(filter);
    expect(within(map).getByRole('button', { name: /^故宫博物院 ·/ })).toBeInTheDocument();
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

    expect(window.location.hash).toBe('#/object/stele-yishan-inscription');
    expect(workspace).toHaveAttribute('data-mobile-view', 'map');
    expect(screen.getByRole('button', { name: /^西安碑林博物馆 ·/ })).toHaveAttribute('aria-pressed', 'true');
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

    expect(screen.getByRole('heading', { name: '峄山刻石（北宋长安本）' })).toBeInTheDocument();
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
});
