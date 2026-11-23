import { render, screen, within } from '@testing-library/react';
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
  expect(cards.at(-2)).toHaveTextContent('1962');
  expect(cards.at(-1)).toHaveTextContent('1976');
});

it('keeps the rubbing’s transmission separate from the original stone on a direct map link', () => {
  visit('#/transmission/dpm-rubbing-xin00045406');
  const page = screen.getByRole('main');
  expect(within(page).getByRole('heading',{level:1})).toHaveTextContent('民国拓本');
  expect(within(page).getByText(/所引资料尚未记下这件实物/)).toBeVisible();
  expect(within(page).queryByText(/在地下数米处发现此石/)).not.toBeInTheDocument();
});

it('opens the surviving-witness map directly with a witness type selector', () => {
  visit('#/collections');
  expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('传世实物地图');
  expect(screen.getByRole('combobox', {name: '实物类型'})).toContainElement(screen.getByRole('option', {name: '拓本'}));
  expect(screen.getByRole('group', {name: '本图点位'})).toBeVisible();
});
