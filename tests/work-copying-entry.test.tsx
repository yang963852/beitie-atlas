import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { copyingNotesFor, copyingPeopleFor, WorkCopyingEntry } from '../src/components/WorkCopyingEntry';
import { getDataset } from '../src/domain/data';
import { knowledgeArticles, type KnowledgeArticle } from '../src/domain/knowledge';
import { findEntry, type LibraryEntry } from '../src/domain/library';
import type { Work } from '../src/domain/types';
import { LocaleProvider } from '../src/i18n';

const dataset = getDataset();
const entry = (id: string) => findEntry('works', id)!;
const objectsFor = (id: string) => dataset.objects.filter((object) => object.workId === id);

function renderEntry(work: LibraryEntry, objects = objectsFor(work.id), notes = copyingNotesFor(work.id, knowledgeArticles)) {
  return render(<LocaleProvider>
    <WorkCopyingEntry objects={objects} notes={notes} people={copyingPeopleFor(work)} />
  </LocaleProvider>);
}

function expand() {
  const disclosure = document.querySelector<HTMLDetailsElement>('.copying-entry')!;
  expect(disclosure).not.toHaveAttribute('open');
  fireEvent.click(screen.getByText('临这件要知道什么'));
  expect(disclosure).toHaveAttribute('open');
  return disclosure;
}

beforeEach(() => {
  localStorage.clear();
});

describe('work copying entry', () => {
  it('renders all categories with sourced object facts and working reading links', () => {
    renderEntry(entry('yan-qinli-bei'));
    const disclosure = expand();

    expect(within(disclosure).getByRole('heading', { name: '实物要点' })).toBeVisible();
    expect(within(disclosure).getByRole('heading', { name: '细读笔记' })).toBeVisible();
    expect(within(disclosure).getByRole('heading', { name: '书家' })).toBeVisible();
    expect(within(disclosure).getByRole('link', { name: /颜勤礼碑（原石）/ })).toHaveAttribute('href', '#/transmission/yan-qinli-original-stele');
    expect(disclosure.textContent).toContain('原石');
    expect(disclosure.textContent).toContain('779年');
    expect(within(disclosure).getByRole('link', { name: '从一个「故」字读《颜勤礼碑》' })).toHaveAttribute('href', '#/note/yan-qinli-story');
    expect(within(disclosure).getByRole('link', { name: '颜真卿' })).toHaveAttribute('href', '#/person/yan-zhenqing');
  });

  it('renders only witness details when no note or linked calligrapher exists', () => {
    renderEntry(entry('beibi-stone'));
    const disclosure = expand();

    expect(within(disclosure).getByRole('heading', { name: '实物要点' })).toBeVisible();
    expect(within(disclosure).queryByRole('heading', { name: '细读笔记' })).not.toBeInTheDocument();
    expect(within(disclosure).queryByRole('heading', { name: '书家' })).not.toBeInTheDocument();
  });

  it('renders only a linked calligrapher when no note or witness exists', () => {
    renderEntry(entry('jian-jizhi-biao'));
    const disclosure = expand();

    expect(within(disclosure).queryByRole('heading', { name: '实物要点' })).not.toBeInTheDocument();
    expect(within(disclosure).queryByRole('heading', { name: '细读笔记' })).not.toBeInTheDocument();
    expect(within(disclosure).getByRole('heading', { name: '书家' })).toBeVisible();
    expect(within(disclosure).getByRole('link', { name: '钟繇' })).toHaveAttribute('href', '#/person/zhong-yao');
  });

  it('renders only a close-reading note when no witness or calligrapher exists', () => {
    const original = entry('yan-qinli-bei');
    const withoutPeople = { ...original, work: { ...original.work!, attribution: [] } };
    renderEntry(withoutPeople, [], copyingNotesFor(original.id, knowledgeArticles));
    const disclosure = expand();

    expect(within(disclosure).queryByRole('heading', { name: '实物要点' })).not.toBeInTheDocument();
    expect(within(disclosure).getByRole('heading', { name: '细读笔记' })).toBeVisible();
    expect(within(disclosure).queryByRole('heading', { name: '书家' })).not.toBeInTheDocument();
  });

  it('omits the entire disclosure when all categories are empty', () => {
    const original = entry('yan-qinli-bei');
    const withoutPeople = { ...original, work: { ...original.work!, attribution: [] } };
    const { container } = renderEntry(withoutPeople, [], []);
    expect(container.querySelector('.copying-entry')).toBeNull();
  });

  it('selects only close-reading notes for this exact work', () => {
    const original = knowledgeArticles.find((article) => article.id === 'yan-qinli-story')!;
    const articles: KnowledgeArticle[] = [
      original,
      { ...original, id: 'other-work', works: ['boyuan'] },
      { ...original, id: 'topic', category: 'topic' },
      { ...original, id: 'path', category: 'path' },
      { ...original, id: 'work-guide', kind: 'works' },
      { ...original, id: 'person-guide', kind: 'people' },
    ];
    expect(copyingNotesFor('yan-qinli-bei', articles).map((article) => article.id)).toEqual(['yan-qinli-story']);
  });

  it('links only calligraphers with a person page and keeps attribution uncertainty', () => {
    const original = entry('yan-qinli-bei');
    const credit = original.work!.attribution.find((item) => item.personId === 'yan-zhenqing')!;
    const work: Work = {
      ...original.work!,
      attribution: [
        credit,
        { ...credit, personId: 'yan-zhenqing' },
        { ...credit, personId: null },
        { ...credit, personId: 'missing-person' },
        { ...credit, role: 'author' },
        { ...credit, role: 'engraver' },
        { ...credit, personId: 'wang-xizhi', certainty: 'disputed' },
      ],
    };
    const people = copyingPeopleFor({ ...original, work });
    expect(people.map((person) => person.entry.id)).toEqual(['yan-zhenqing', 'wang-xizhi']);
    expect(people[1].certainty).toBe('disputed');
  });

  it('uses the paired English interface labels without generating translations', () => {
    localStorage.setItem('beitie.locale', 'en');
    renderEntry(entry('jian-jizhi-biao'));
    fireEvent.click(screen.getByText('Before you copy this work'));
    expect(screen.getByRole('heading', { name: 'Calligraphers' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Zhong Yao' })).toHaveAttribute('href', '#/person/zhong-yao');
  });
});
