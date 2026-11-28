import { fireEvent, waitFor, render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import App from '../src/App';
import { libraryEntries } from '../src/domain/library';

function visit(hash: string) {
  window.history.replaceState(null, '', hash);
  render(<App />);
}

it('includes guide-only works after the historic catalogue in source year order', () => {
  visit('#catalogue');
  const cards = Array.from(document.querySelectorAll<HTMLAnchorElement>('.atlas-card'));
  expect(cards).toHaveLength(libraryEntries.filter(e => e.kind === 'works').length);
  expect(cards.slice(-2).map(card => card.hash)).toEqual([
    '#/folio/shen-yinmo-dakai-jia', '#/folio/zhao-puchu-shen-colophon',
  ]);
  expect(cards.at(-2)).toHaveTextContent('甲种本大楷习字帖');
  expect(cards.at(-1)).toHaveTextContent('行书跋沈尹默论书札卷');
});

it('keeps the rubbing’s transmission separate from the original stone on a direct map link', () => {
  visit('#/transmission/dpm-rubbing-xin00045406');
  const page = screen.getByRole('main');
  expect(within(page).getByRole('heading',{level:1})).toHaveTextContent('民国拓本');
  expect(within(page).getByText(/所引资料尚未记下这件实物/)).toBeVisible();
  expect(within(page).queryByText(/在地下数米处发现此石/)).not.toBeInTheDocument();
});

it('opens the extant map directly with a witness type selector', () => {
  visit('#/collections');
  expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('访碑');
  expect(screen.getByRole('combobox', {name: '实物类型'})).toContainElement(screen.getByRole('option', {name: '拓本'}));
  expect(screen.getByRole('group', {name: '本图点位'})).toBeVisible();
});

it('filters surviving witnesses by province and lists their titles', () => {
  visit('#/collections');
  const provinces = screen.getByRole('group', { name: '按省份筛选' });
  fireEvent.click(within(provinces).getByRole('button', { name: /^陕西/ }));

  const panel = screen.getByRole('complementary', { name: '按省份浏览' });
  expect(within(panel).getByRole('button', { name: /颜勤礼碑（原石）/ })).toBeVisible();
  expect(within(panel).queryByRole('button', { name: /伯远帖/ })).not.toBeInTheDocument();

  fireEvent.click(within(provinces).getByRole('button', { name: /^全部/ }));
  expect(within(panel).queryByRole('button', { name: /颜勤礼碑（原石）/ })).not.toBeInTheDocument();
});

it('shows the coordinate caveat for a representative map point', () => {
  visit('#/collections');
  expect(screen.getByText(/以北海公园（维基数据 Q133650）作代表点/)).toBeVisible();
});

it('keeps a province place without coordinates readable and marks it not mapped', () => {
  visit('#/collections');
  const provinces = screen.getByRole('group', { name: '按省份筛选' });
  fireEvent.click(within(provinces).getByRole('button', { name: /^陕西/ }));

  const panel = screen.getByRole('complementary', { name: '按省份浏览' });
  expect(within(panel).getByText('汉中市博物馆')).toBeVisible();
  expect(within(panel).getByText('石门颂（摩崖）')).toBeVisible();
  expect(within(panel).getByText('石门铭（摩崖）')).toBeVisible();
  expect(within(panel).getAllByText('未上图').length).toBeGreaterThan(0);
});

it('restores the selected province after reading a witness', async () => {
  visit('#/collections');
  const provinces = screen.getByRole('group', { name: '按省份筛选' });
  const shaanxi = within(provinces).getByRole('button', { name: /^陕西/ });
  fireEvent.click(shaanxi);

  const panel = screen.getByRole('complementary', { name: '按省份浏览' });
  fireEvent.click(within(panel).getByRole('button', { name: /颜勤礼碑（原石）/ }));
  await waitFor(() => expect(screen.queryByRole('group', { name: '按省份筛选' })).toBeNull());

  window.history.back();
  await waitFor(() => {
    const restored = within(screen.getByRole('group', { name: '按省份筛选' }))
      .getByRole('button', { name: /^陕西/ });
    expect(restored).toHaveAttribute('aria-pressed', 'true');
  });
});

it('restores the collection filter and open place after reading a witness', async () => {
  visit('#/collections');
  const filter = () => screen.getByRole('combobox', { name: '实物类型' });
  fireEvent.change(filter(), { target: { value: 'original-stele' } });
  const index = () => screen.getByRole('group', { name: '本图点位' });
  const place = within(index()).getAllByRole('button')[0];
  const label = place.textContent!;
  fireEvent.click(place);
  fireEvent.click(document.querySelector<HTMLButtonElement>('.place-card__list button')!);
  await waitFor(() => expect(screen.queryByRole('combobox', { name: '实物类型' })).toBeNull());
  window.history.back();
  await waitFor(() => expect(filter()).toHaveValue('original-stele'));
  await waitFor(() => {
    const restored = within(index()).getAllByRole('button').find(b => b.textContent === label);
    expect(restored).toHaveAttribute('aria-pressed', 'true');
  });
});

it('shows the editorial inference alongside both colophon dates on transmission links', () => {
  visit('#/transmission/witness-jizhi');
  const page = screen.getByRole('main');
  expect(page).toHaveTextContent('1282');
  expect(page).toHaveTextContent('1283');
  expect(page).toHaveTextContent('编辑推定');
});
