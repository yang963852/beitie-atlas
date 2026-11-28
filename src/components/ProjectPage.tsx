import { useLocale } from '../i18n';
import { BUILD_STAMP } from '../domain/version';
import { LocaleSwitch } from './LocaleSwitch';
import './project-page.css';

/**
 * Two static reading pages. They live in the entry chunk because they carry no
 * corpus data: a reader who only wants to know what this project is should not
 * download the compiled library. Both languages are written by hand, in pairs,
 * so the Chinese original and its English translation stay aligned.
 */

export type ProjectPageKind = 'about' | 'join';

const REPO = 'https://github.com/yang963852/beitie-atlas';
const SITE = 'https://yang963852.github.io/beitie-atlas/';
const KNOWLEDGE_ISSUE = `${REPO}/issues/new?template=knowledge.yml`;
const FEEDBACK_ISSUE = `${REPO}/issues/new?template=beta-feedback.yml`;

interface Section {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

interface PageCopy {
  kicker: string;
  title: string;
  paragraphs: string[];
  sections: Section[];
  motto: string;
  closing: string[];
  links: { href: string; label: string }[];
  note?: string;
}

interface Copy {
  about: PageCopy;
  join: PageCopy;
  nav: { desk: string; atlas: string; chronology: string; reading: string; about: string; join: string };
  skip: string;
  navLabel: string;
  home: string;
  footerNote: string;
}

const COPY: Record<'zh' | 'en', Copy> = {
  zh: {
    about: {
      kicker: '碑帖之间 · Between Steles',
      title: '关于碑帖之间',
      paragraphs: [
        '我们是一群热爱书法的人。',
        '最初，我们只是想知道案头临习的碑帖来自哪里，今天又藏在何处。后来，我们发现，一件碑帖背后，是书家的人生、时代的变迁，也是历代书写者对美的理解。',
        '于是有了碑帖之间。',
        '我们希望从一件件经典碑帖出发，逐渐建立一个开放共享的书法知识空间。这里有作品、书家、历史与文献，也可以有学习中的发现、疑问与思考。',
        '我们希望书法走向大众。书法不仅是一门艺术，也可以是认识历史、感受美、表达自己的一种方式。',
        '我们相信，真正的理解来自学习与实践，人与人之间的交流始终具有不可替代的价值。',
        '碑帖之间不试图代替书法老师，而希望为每一位书法学习者提供一些知识、线索和启发。',
        '我们坚持开源与共享，也欢迎每一位热爱书法的人参与其中。',
      ],
      sections: [],
      motto: '人人为我，我为人人。',
      closing: [
        '不必急于成为书法家，也不必急于给所有问题找到答案。愿我们在一笔一画之间，逐渐认识书法，也认识自己。',
      ],
      links: [
        { href: `${REPO}/blob/main/docs/PROJECT.md`, label: '阅读完整项目理念' },
        { href: `${SITE}#/join`, label: '参与共建' },
      ],
    },
    join: {
      kicker: '碑帖之间 · Between Steles',
      title: '参与共建',
      paragraphs: [
        '碑帖之间因共同的热爱而存在。',
        '无论你刚刚开始学习书法，还是已经临习多年，都可以参与项目的建设。你不必是书法专家，也不需要懂编程或人工智能。',
      ],
      sections: [
        {
          heading: '你可以做些什么？',
          items: [
            '分享临帖中的观察、经验与疑问。',
            '补充经典碑帖、书家及相关历史知识。',
            '提供可靠的馆藏信息、图录、书籍与研究文献。',
            '分享访碑、观展过程中的发现。',
            '纠正知识库中的错误，提出阅读与学习建议。',
            '参与书法讨论，分享自己的理解与思考。',
            '利用项目的开放资源，自行开展学习、研究与文化活动。',
          ],
          paragraphs: [
            '一条文献线索、一处文字勘误、一次真实的学习体会，都具有价值。',
            '我们尊重贡献者的署名、个人观点与原创表达，也希望所有事实性知识都能够追溯其来源。',
          ],
        },
        {
          heading: '如何参与？',
          paragraphs: [
            '你可以通过现有投稿入口提供资料，也可以在 GitHub 上直接参与知识库与网站建设。',
            '网站是 GitHub Pages 上的静态页面。实物记录里的「补充或纠正这条记录」只生成一段可阅读、可复制的文字，并在你点击时打开 GitHub 的预填投稿页；页面本身不保存、不发送内容，也不会自动发布。目前没有站内投稿后台、账号体系或公开的专用联系方式。',
            '不会使用 GitHub 的朋友，可以先整理好自己的文字，请熟悉 GitHub 的朋友代为提交，或在已有的公开 Issue 中留言，由维护者在公开渠道协助整理。请勿在公开页面填写隐私信息。',
            '不必为了贡献而改变自己的学习方式。临帖、阅读、讨论，本身就是建设碑帖之间的起点。',
          ],
        },
      ],
      motto: '人人为我，我为人人。',
      closing: [],
      links: [
        { href: KNOWLEDGE_ISSUE, label: '资料投稿或勘误（公开 GitHub Issue）' },
        { href: FEEDBACK_ISSUE, label: '内测反馈' },
        { href: `${REPO}/blob/main/docs/CONTRIBUTE.zh-CN.md`, label: '中文投稿与试读指南' },
        { href: `${REPO}/blob/main/CONTRIBUTING.md`, label: '贡献指南' },
        { href: `${REPO}/blob/main/docs/PROJECT.md`, label: '阅读完整项目理念' },
      ],
      note: '现阶段不需要开发注册登录、在线论坛、积分排名、个人主页等功能。',
    },
    nav: { desk: '案头', atlas: '访碑', chronology: '编年', reading: '读帖', about: '关于', join: '共建' },
    skip: '跳到正文',
    navLabel: '页面导航',
    home: '返回案头',
    footerNote: '年代、坐标与收藏信息都是来源的陈述，不是实时事实。',
  },
  en: {
    about: {
      kicker: 'Between Steles · 碑帖之间',
      title: 'About Between Steles',
      paragraphs: [
        'We are a group of people who love calligraphy.',
        'At first we simply wanted to know where the stele or modelbook on our desk came from, and where it is kept today. Later we found that behind a single work lies a calligrapher’s life, the changes of an era, and generations of writers’ understanding of beauty.',
        'That is how Between Steles began.',
        'We hope, one classical work at a time, to build an open and shared space for knowledge about calligraphy. It holds works, calligraphers, history and literature — and also the discoveries, questions and reflections that arise while learning.',
        'We want calligraphy to reach a wider public. Calligraphy is not only an art; it can also be a way to understand history, feel beauty and express oneself.',
        'We believe real understanding comes from study and practice, and that conversation between people remains irreplaceable.',
        'Between Steles does not try to take the place of a calligraphy teacher. We hope to offer every learner some knowledge, leads and inspiration.',
        'We keep the project open and shared, and we welcome everyone who loves calligraphy to take part.',
      ],
      sections: [],
      motto: 'Everyone contributes for the benefit of others, and everyone benefits from what others share.',
      closing: [
        'There is no need to hurry to become a calligrapher, and no need to find answers to every question. May we come, stroke by stroke, to understand calligraphy — and ourselves.',
      ],
      links: [
        { href: `${REPO}/blob/main/docs/PROJECT.en.md`, label: 'Read the full project philosophy' },
        { href: `${SITE}#/join`, label: 'Join in' },
      ],
    },
    join: {
      kicker: 'Between Steles · 碑帖之间',
      title: 'Join in',
      paragraphs: [
        'Between Steles exists because of a shared love of calligraphy.',
        'Whether you have just begun to learn calligraphy or have been copying for years, you can help build the project. You need not be an expert in calligraphy, or know programming or artificial intelligence.',
      ],
      sections: [
        {
          heading: 'What you can do',
          items: [
            'Share observations, experience and questions from your copying practice.',
            'Add knowledge about classical works, calligraphers and their historical context.',
            'Supply reliable collection information, catalogues, books and research literature.',
            'Share discoveries from visits to steles or exhibitions.',
            'Correct errors in the knowledge base, or suggest better ways to read and learn.',
            'Take part in conversations about calligraphy and share your own understanding and reflections.',
            'Use the project’s open resources for your own study, research and cultural activities.',
          ],
          paragraphs: [
            'A single documentary lead, one textual correction, or one honest account of learning is valuable.',
            'We respect contributors’ names, personal views and original expression, and we hope every factual statement can be traced back to a source.',
          ],
        },
        {
          heading: 'How to take part',
          paragraphs: [
            'You can offer material through the existing submission channels, or work directly on the knowledge base and the website on GitHub.',
            'The site is a static GitHub Pages site. The “Add or correct information” panel on a record composes text you can read and copy, and, if you choose, opens a pre-filled GitHub issue. The page stores and sends nothing itself, and nothing is published automatically. There is no in-site submission backend, no account system and no dedicated public contact address.',
            'If you do not use GitHub, prepare your text and ask someone who does to submit it for you, or leave a note in an existing public issue; the maintainers help organise what is shared in public. Please do not include private contact details on a public page.',
            'You do not need to change the way you study in order to contribute. Copying, reading and talking about calligraphy are already the beginning of building Between Steles.',
          ],
        },
      ],
      motto: 'Everyone contributes for the benefit of others, and everyone benefits from what others share.',
      closing: [],
      links: [
        { href: KNOWLEDGE_ISSUE, label: 'Knowledge submission or correction (public GitHub issue)' },
        { href: FEEDBACK_ISSUE, label: 'Report a site problem' },
        { href: `${REPO}/blob/main/docs/CONTRIBUTE.zh-CN.md`, label: 'Chinese contribution and read-through guide' },
        { href: `${REPO}/blob/main/CONTRIBUTING.md`, label: 'Contributing guide' },
        { href: `${REPO}/blob/main/docs/PROJECT.en.md`, label: 'Read the full project philosophy' },
      ],
      note: 'At this stage there is no need for accounts, an online forum, points or rankings, or personal profile pages.',
    },
    nav: { desk: 'Desk', atlas: 'Atlas', chronology: 'Chronology', reading: 'Reading room', about: 'About', join: 'Join in' },
    skip: 'Skip to the main text',
    navLabel: 'Page navigation',
    home: 'Back to the desk',
    footerNote: 'Dates, coordinates and collection statements record what sources say; they are not live facts.',
  },
};

export function ProjectPage({ page }: { page: ProjectPageKind }) {
  const { locale, strings } = useLocale();
  const copy = COPY[locale];
  const content = copy[page];
  const lang = locale === 'zh' ? 'zh-Hans' : 'en';

  const navLinks = [
    { href: '#', label: copy.nav.desk },
    { href: '#/collections', label: copy.nav.atlas },
    { href: '#catalogue', label: copy.nav.chronology },
    { href: '#/library', label: copy.nav.reading },
    { href: '#/about', label: copy.nav.about, key: 'about' },
    { href: '#/join', label: copy.nav.join, key: 'join' },
  ];

  return (
    <div className="app project-page">
      <a className="skip-link" href="#project-content">{copy.skip}</a>

      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <span className="brand__seal" aria-hidden="true">碑</span>
            <span className="brand__zh" lang="zh-Hans">{strings.siteTitleZh}</span>
            <span className="brand__en" lang="en">{strings.siteTitleEn}</span>
          </div>
          <div className="topbar__actions">
            <LocaleSwitch />
          </div>
        </div>
      </header>

      <nav className="topnav project-nav" aria-label={copy.navLabel}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            className="topnav__link"
            href={link.href}
            aria-current={link.key === page ? 'page' : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <main id="project-content" className="project-main" tabIndex={-1} lang={lang}>
        <article className="project-sheet">
          <p className="project-kicker">{content.kicker}</p>
          <h1>{content.title}</h1>

          {content.paragraphs.map((text) => <p key={text}>{text}</p>)}

          {content.sections.map((section) => (
            <section className="project-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.items ? (
                <ul className="project-list">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
              {section.paragraphs?.map((text) => <p key={text}>{text}</p>)}
            </section>
          ))}

          <p className="project-motto">{content.motto}</p>
          {content.closing.map((text) => <p key={text}>{text}</p>)}

          {content.note ? <p className="project-note">{content.note}</p> : null}

          <div className="project-links">
            {content.links.map((link) => (
              <a className="button" key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>

          <p className="project-back">
            <a href="#">{copy.home}</a>
          </p>
        </article>
      </main>

      <footer className="footer">
        <span className="footer__note">{BUILD_STAMP[locale]}</span>
        <span className="footer__note"> · {copy.footerNote}</span>
        <span className="footer__note"> · <a href={`${REPO}/blob/main/docs/PROJECT.md`}>{locale === 'zh' ? '项目理念' : 'Project philosophy'}</a></span>
      </footer>
    </div>
  );
}
