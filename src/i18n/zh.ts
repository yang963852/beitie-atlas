/**
 * 中文界面文案。默认语言。
 *
 * 这里只放界面用语。实物名称、地点、年代原文与出处标题都来自数据，不在此翻译；
 * 年代、坐标与收藏属于来源陈述，措辞上不能写成今日的确凿事实。
 */

import type { Strings } from './en';

export const zhStrings: Strings = {
  siteTitleZh: '碑帖之间',
  siteTitleEn: 'Between Steles',
  taglineLead: '案头所临，',
  tagline: '如今藏在何处',
  enterCatalogue: '打开访碑图',
  studyFilter: '按作品类别筛选',
  studyLabels: { all: '全部', bei: '碑', tie: '帖' },
  draftNotice: '此预览版包含仍待审核的记录。请以每条记录的引证为准。',

  languageLabel: '语言',
  languageZh: '中文',
  languageEn: 'EN',

  /** 项目级导航与首页简述。完整理念见 docs/PROJECT.md，此处只放入口文字。 */
  navAbout: '关于',
  navJoin: '共建',
  homeLead: '从案头一帖，走向更广阔的书法世界。',
  homeLede: '认识历史，感受美，分享我们的学习与思考。',
  motto: '人人为我，我为人人。',

  sectionsLabel: '页面分区',
  resultsHeading: '记录',
  resultsCount: (shown: number, total: number) => `${shown} / ${total} 条`,
  searchLabel: '搜索记录',
  searchPlaceholder: '作品、书家或馆藏编号',
  clearSearch: '清除',
  noResults: '没有符合这个条件的记录。',
  emptyCorpus: '暂无可显示的记录。',
  lastKnownPlace: (name: string) => `最后已知：${name}`,

  mobileViewLabel: '切换视图',
  mobileListView: '列表',
  mobileMapView: '地图',
  backToRecords: '返回记录',

  detailEmptyTitle: '请选择一件实物',
  detailEmptyBody: '从左侧记录中选择一件实物，查看它的现藏依据、递藏与流传与出处。',
  detailHeading: '实物详情',
  workLabel: '所属作品',
  catalogueLabel: '馆藏编号',
  dimensionsLabel: '尺寸',
  survivalLabel: '存佚',
  workDateLabel: '作品年代',
  objectDateLabel: '实物年代',
  sourceWording: '原文表述',
  collectionHeading: '现藏依据',
  collectionChecked: (date: string) => `来源查阅于 ${date}`,
  collectionAssertionAsOf: (date: string) => `来源所述时间：${date}`,
  collectionNotStated: '现藏何处，尚待访考。',
  locationKindLabels: {
    'collection-institution': '收藏机构',
    'in-situ': '原址保存',
    'last-known': '最后已知地点',
    unknown: '地点不详',
  },

  provenanceHeading: '递藏与流传',
  provenanceIntro: '循著录与题跋，看这件实物曾在何人手中、何处停留。其间缺环，留待考证。',
  provenanceEmpty: '所引资料尚未记下这件实物的递藏经过。',
  eventPlaceUnknown: '地点未记载',

  notesHeading: '编辑说明与待补',
  /** Which record the following notes belong to; a physical object, its work, or its place. */
  notesScopes: {
    object: '本条实物',
    work: '所属作品',
    place: '收藏地点',
  },
  sourcesHeading: '本记录引用的出处',
  sourcesControl: (count: number) => `出处（${count}）`,
  sourceAccessed: (date: string) => `查阅于 ${date}`,
  sourceLocator: '定位',

  backgroundHeading: '作品背景',
  backgroundLanguageNote: '按记录语言显示，不做即时翻译。',

  copyingEntryTitle: '临这件要知道什么',
  copyingEntryObjects: '实物要点',
  copyingEntryNotes: '细读笔记',
  copyingEntryPeople: '书家',

  contributeAction: '补充或纠正这条记录',
  contributeTitle: '提交资料',
  contributeIntro:
    '你可以提供这件实物、它的现藏地点或流转经过。提交只作为线索：须有可核对的来源，并经编辑核实后才可能收入。',
  contributeFor: (title: string) => `关于：${title}`,
  contributeDetailsLabel: '你掌握的信息',
  contributeDetailsPlaceholder: '例如：某次清点的时间、一次迁移、碑文细节，或对本记录的纠正。',
  contributeSourceLabel: '在哪里可以核对',
  contributeSourcePlaceholder: '博物馆、图书馆、文物或政府部门页面；或注明页码的印刷图录。',
  contributeContactLabel: '如何联系你（可不填）',
  contributeContactPlaceholder: '仅填写愿意公开的联系方式，例如 GitHub 用户名。',
  contributeNotice:
    '提交不会自动发布。没有来源的回忆、碑帖应用截图只作线索，不作为收录依据。',
  contributePreviewLabel: '将要提交的文字',
  contributeSubmit: '打开提交页',
  contributeCopy: '复制这段文字',
  contributeCopied: '已复制。',
  contributeCopyFailed: '复制失败，请手动选择上面的文字复制。',
  contributeRequired: '请先写下你掌握的信息。',
  contributeChannelNote:
    '打开提交页会把这段文字传给 GitHub 预填；点击发布后问题将公开。请勿填写隐私信息。',
  contributeClose: '关闭',
  contributeFooterLink: '提交资料',

  reviewDraft: '草稿',

  mapHeading: '地图',
  collectionAtlasTitle: '访碑',
  collectionAtlasLede:
    '按今天的收藏地或原址，查看现存实物所在的地点。选择省份，读该省现存的碑帖与其他实物。',
  collectionAtlasGapNote: '没有可引用坐标的地点只列文字，不猜位置。',
  collectionAtlasWitnesses: '现存实物',
  provincesHeading: '按省份浏览',
  provincesHint: '选择省份查看该省现存实物；标「未上图」的地点没有可引用坐标。',
  provincesFilterLabel: '按省份筛选',
  provincesAll: '全部',
  provinceCount: (count: number) => `${count} 件`,
  provincePlaceCount: (count: number) => `${count} 处`,
  provinceNotMapped: '未上图',
  provinceUnknown: '省份待考',
  provinceUnplaced: '地点待考',
  provinceUnplacedHint: '这些现存实物没有当前收藏地点，无法按省份上图。',
  mapOriginalsOnly: '仅显示存世原件',
  mapSubheading: '查看碑刻与拓本有据可查的收藏机构和原址。',
  mapPointHint: '点击任意点位，查看此处收藏的实物——原石与拓本都在内。',
  mapPointIndexLabel: '本图点位',
  mapPointIndexCount: (count: number) => `${count} 条记录`,
  mapCoverage: (mapped: number, total: number) => `${total} 处地点中 ${mapped} 处有坐标记录`,
  coordinateOverview: '经纬度点位示意 · 无底图',
  noMapPoints: '当前结果暂无有据可查的坐标。',
  mapLoading: '正在加载地图…',
  mapLoadingHint: '正在向服务商请求底图。',
  mapUnavailableTitle: '地图未启用',
  mapUnavailableBody:
    '记录、现藏依据与出处都照常可读。配置天地图密钥后即显示真实底图；在此之前，这里改为列出全部有记载的地点。',
  mapErrorTitle: '地图加载失败',
  mapErrorBody: '阅读、搜索与出处链接不受影响。可以重试，也可以使用下方的地点列表。',
  mapRetry: '重试',
  mapTilesBlocked:
    '底图未能加载，通常是密钥或域名白名单限制。点位、地点列表与全部资料仍可正常使用。',
  mapFitAll: '显示全部点位',
  mapDeveloperDetails: '开发者信息',
  mapFailureDevNote: (code: string, message: string) => `${code}：${message}`,
  mapAttributionLabel: '地图服务',
  mapAttributionText:
    '天地图（国家地理信息公共服务平台）。按服务商条款展示，审图号由服务商标注。',
  mapFrameNote:
    '标记位置是记录中保存的 WGS84 坐标，未经基准转换直接交给服务商。底图为 CGCS2000，而这些坐标本身是尚未核实的机构级点位，因此标记只作指示，不是实测位置。',
  placeCardLabel: '选中的地点',
  closePlaceCard: '关闭',

  locationsHeading: '地点列表',
  locationsIntro:
    '当前结果中所有有记载的现藏地点，附坐标来源与核查状态。这个列表是地图的键盘可访问等价物。',
  locationsWithoutPointHeading: '暂无地图点位的记录',
  locationsWithoutPointIntro:
    '这些记录仍然可以阅读。「最后已知地点」是历史陈述，不是今日的收藏点，因此不会绘制成标记。',
  placeNotRecorded: '地点未记载',
  unmappedReasons: {
    historical: '非当前收藏点',
    unknown: '地点不详',
    'no-point': '无坐标记录',
  },
  locationsEmpty: '暂无已核实的点位。',
  coordinateDetails: '坐标与精度',
  precisionLabel: '精度',
  coordinateSourceLabel: '坐标来源',
  coordinateVerified: '已核实',
  coordinateUnverified: '未核实（二手来源）',
  noCoordinates: '无坐标记录',
  openInMap: '在地图上查看',
  objectsAtPlace: (count: number) => `${count} 条记录在此`,

  precisionLabels: {
    site: '具体地点',
    institution: '机构',
    city: '城市',
    region: '区域',
  },

  footerNote:
    '年代、坐标与收藏信息都是来源的陈述，不是实时事实。中国大陆的公网访问尚未测试。',
  buildInfoLabel: '构建与数据检查',
  buildInfoOk: (objects: number, events: number, warnings: number) =>
    `本地检查通过：${objects} 条实物记录，${events} 条有出处的历史事件${
      warnings > 0 ? `，${warnings} 条校验警告` : ''
    }。`,
  skipToResults: '跳到记录列表',

  objectTypeLabels: {
    'ink-manuscript': '墨迹',
    'manuscript-copy': '墨迹摹本',
    'original-stele': '原石',
    'cliff-inscription': '摩崖',
    'bronze-vessel': '青铜器',
    recarving: '翻刻',
    rubbing: '拓本',
    fragment: '残石',
  },
  attributionRoleLabels: {
    'author-and-calligrapher': '撰文并书丹',
    author: '撰文',
    calligrapher: '书丹',
    copyist: '摹写',
    'colophon-author': '题跋',
    engraver: '刻字',
    'title-writer': '篆额',
    compiler: '集字',
    sponsor: '立石',
    unknown: '未署名',
  },
  attributionRoleShort: {
    'author-and-calligrapher': '撰并书',
    author: '撰',
    calligrapher: '书',
    copyist: '摹',
    'colophon-author': '跋',
    engraver: '刻',
    'title-writer': '篆额',
    compiler: '集',
    sponsor: '立石',
    unknown: '未署名',
  },
  attributionHeading: '署名',
  objectAttributionHeading: '此件署名',
  claimsHeading: '异说与意见',
  claimKindLabels: {
    'source-report': '来源记载',
    'scholarly-opinion': '学术意见',
    'editor-interpretation': '编辑解释',
  },
  claimStanceLabels: {
    supports: '支持',
    questions: '质疑',
    neutral: '陈述',
  },
  versionHeading: '版本',
  versionBasisLabel: '归组依据',
  dateMeaningLabels: {
    composition: '创作',
    publication: '刊行',
    colophon: '题跋',
    production: '制作',
    discovery: '出土',
    accession: '入藏',
    other: '其他',
  },
  dynastyUnknown: '朝代未记',
  dynastyFactLabel: '朝代',
  eventTypeLabels: {
    composition: '撰书',
    carving: '刻石',
    discovery: '出土',
    relocation: '迁移',
    custody: '保管',
    'rubbing-taken': '拓制',
    accession: '入藏',
    documented: '见于记载',
    other: '其他',
  },
  survivalLabels: {
    surviving: '存世',
    lost: '已佚',
    unknown: '不详',
  },
  certaintyLabels: {
    documented: '有明确记载',
    approximate: '约略',
    disputed: '有争议',
    unknown: '不详',
  },
  crashTitle: '页面未能显示',
  crashBody:
    '这次渲染在记录显示完成前中断了。数据没有变动，可以返回图录另开一条记录；若反复出现，请把下面的报错附在 issue 里。',
  crashBack: '返回图录',
  validationErrorTitle: '本地数据检查未通过',
  validationErrorBody: '以下记录仍会显示，以便排查问题；但这次构建是无效的。',
};
