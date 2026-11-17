import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';

function renderApp() {
  return render(<App />);
}

function resultsList() {
  return screen.getByRole('list', { name: /records/i });
}

/** Models browser Back: the URL changes, then a single hashchange is fired. */
function goBackTo(hash: string) {
  act(() => {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

beforeEach(() => {
  window.location.hash = '';
});

describe('application shell', () => {
  it('lists both object records and opens the first one', () => {
    renderApp();

    const links = within(resultsList()).getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(within(resultsList()).getByText('颜勤礼碑（原石）')).toBeInTheDocument();
    expect(within(resultsList()).getByText('颜勤礼碑（民国拓本）')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: '颜勤礼碑（原石）' })).toBeInTheDocument();
    expect(screen.getByText(/found the stone several metres underground/)).toBeInTheDocument();
  });

  it('shows the rubbing’s own catalogue number and no copied provenance', () => {
    renderApp();

    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（民国拓本）'));

    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();
    expect(screen.getByText('新00045406')).toBeInTheDocument();
    expect(screen.getByText(/No custody events are recorded for this object/)).toBeInTheDocument();
    expect(screen.queryByText(/found the stone several metres underground/)).not.toBeInTheDocument();
    expect(window.location.hash).toBe('#/object/dpm-rubbing-xin00045406');
  });

  it('filters by Chinese, English, and collection name', () => {
    renderApp();
    const search = screen.getByLabelText(/search records/i);

    fireEvent.change(search, { target: { value: '故宫' } });
    expect(within(resultsList()).getAllByRole('link')).toHaveLength(1);
    expect(within(resultsList()).getByText('颜勤礼碑（民国拓本）')).toBeInTheDocument();

    fireEvent.change(search, { target: { value: '00045406' } });
    expect(within(resultsList()).getAllByRole('link')).toHaveLength(1);

    fireEvent.change(search, { target: { value: 'no such record' } });
    expect(screen.getByText(/No record matches this search/)).toBeInTheDocument();
  });

  it('keeps list and detail usable when the map has no configuration', () => {
    renderApp();

    expect(screen.getByText('Map not configured in this build')).toBeInTheDocument();
    expect(within(resultsList()).getAllByRole('link')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: '颜勤礼碑（原石）' })).toBeInTheDocument();

    // The accessible location list still shows the documented institution.
    expect(screen.getAllByText('西安碑林博物馆').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Unverified — secondary source/).length).toBeGreaterThan(0);
  });

  it('opens a record from a hash link', () => {
    window.location.hash = '#/object/dpm-rubbing-xin00045406';
    renderApp();

    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();
    expect(screen.getByText('新00045406')).toBeInTheDocument();
  });

  it('filters the list, the map panel, and the detail together', () => {
    renderApp();
    const search = screen.getByLabelText(/search records/i);

    fireEvent.change(search, { target: { value: '故宫' } });

    expect(within(resultsList()).getAllByRole('link')).toHaveLength(1);
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '颜勤礼碑（民国拓本）' })).toBeInTheDocument();

    const mapPanel = screen.getByRole('region', { name: 'Map pilot' });
    expect(within(mapPanel).queryByText('西安碑林博物馆')).not.toBeInTheDocument();
    expect(within(mapPanel).getAllByText('故宫博物院').length).toBeGreaterThan(0);
    expect(screen.getByText(/Locations without the map/)).toHaveTextContent('(1)');
  });

  it('shows an empty selection and no places when nothing matches', () => {
    renderApp();
    const search = screen.getByLabelText(/search records/i);

    fireEvent.change(search, { target: { value: 'no such record' } });

    expect(screen.getByText(/No record matches this search/)).toBeInTheDocument();
    expect(screen.getByText('Select a record')).toBeInTheDocument();
    expect(screen.queryByText('西安碑林博物馆')).not.toBeInTheDocument();
    expect(screen.getByText(/Locations without the map/)).toHaveTextContent('(0)');
  });

  it('keeps the selected record when a section link is used', () => {
    renderApp();
    fireEvent.click(within(resultsList()).getByText('颜勤礼碑（民国拓本）'));
    expect(window.location.hash).toBe('#/object/dpm-rubbing-xin00045406');

    fireEvent.click(screen.getByRole('link', { name: 'Map pilot' }));

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

    expect(screen.getByRole('heading', { name: '颜勤礼碑（原石）' })).toBeInTheDocument();
  });
});
