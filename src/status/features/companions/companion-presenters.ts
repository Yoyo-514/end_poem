import kohinaAvatar from '../../../../public/kohina_avatar.png?url';
import kohinaPortrait from '../../../../public/kohina_trans.png?url';
import midoriAvatar from '../../../../public/midori_avatar.png?url';
import midoriPortrait from '../../../../public/midori_trans.png?url';
import mioAvatar from '../../../../public/mio_avatar.png?url';
import mioPortrait from '../../../../public/mio_trans.png?url';
import shiroAvatar from '../../../../public/shiro_avatar.png?url';
import shiroPortrait from '../../../../public/shiro_trans.png?url';
import type { RawStatusData } from '../../types/status';

export type StatusCompanionId = 'user' | 'mio' | 'shiro' | 'kohina' | 'midori' | 'lily';

export type StatusCompanionTheme = 'traveler' | 'mio' | 'shiro' | 'kohina' | 'midori' | 'lily';

export interface StatusCompanionEntry {
  label: string;
  value: string;
  description?: string;
  quantity?: string;
  children?: StatusCompanionEntry[];
}

export interface StatusCompanionSection {
  id: string;
  title: string;
  entries: StatusCompanionEntry[];
}

export interface StatusCompanionProfile {
  id: StatusCompanionId;
  name: string;
  theme: StatusCompanionTheme;
  joined: boolean;
  locked: boolean;
  mystery: boolean;
  portrait?: string;
  avatar?: string;
  placeholder: string;
  roles: string[];
  status: string[];
  summary: string[];
  metrics: StatusCompanionEntry[];
  posture: string;
  sections: StatusCompanionSection[];
}

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  _.isObject(value) && !_.isArray(value) ? (value as UnknownRecord) : {};

const toText = (value: unknown): string => {
  if (_.isString(value)) {
    return value.trim();
  }
  if (_.isNumber(value) || _.isBoolean(value)) {
    return String(value);
  }
  return '';
};

const toTextList = (value: unknown): string[] => {
  if (_.isArray(value)) {
    return value.map(item => toText(item)).filter(Boolean);
  }

  const text = toText(value);
  return text ? [text] : [];
};

const makeMetric = (label: string, value: unknown): StatusCompanionEntry | null => {
  const text = toText(value);
  return text ? { label, value: text } : null;
};

const compactEntries = (entries: Array<StatusCompanionEntry | null>): StatusCompanionEntry[] =>
  entries.filter(Boolean) as StatusCompanionEntry[];

const redactDivineText = (value: unknown): unknown => {
  if (_.isString(value)) {
    return value.includes('神') ? '???' : value;
  }

  if (_.isArray(value)) {
    return value.map(redactDivineText);
  }

  if (_.isObject(value)) {
    return _.mapValues(value as UnknownRecord, redactDivineText);
  }

  return value;
};

const makeSection = (id: string, title: string, entries: StatusCompanionEntry[]): StatusCompanionSection | null => {
  return entries.length > 0 ? { id, title, entries } : null;
};

const compactSections = (sections: Array<StatusCompanionSection | null>): StatusCompanionSection[] => {
  return sections.filter(Boolean) as StatusCompanionSection[];
};

const mapKeyValueEntries = (value: unknown): StatusCompanionEntry[] => {
  const record = toRecord(value);
  return _.toPairs(record)
    .map(([label, rawValue]) => ({ label, value: toText(rawValue) }))
    .filter(entry => entry.value);
};

const makeAppearanceSections = (appearance: unknown): StatusCompanionSection[] => {
  const appearanceRecord = toRecord(appearance);
  return compactSections([
    makeSection('appearance-face', '外貌', mapKeyValueEntries(appearanceRecord.外貌)),
    makeSection('appearance-clothes', '服饰', mapKeyValueEntries(appearanceRecord.服饰)),
  ]);
};

const makeItemSection = (items: unknown): StatusCompanionSection | null => {
  const entries = _.toPairs(toRecord(items)).map(([label, rawItem]) => {
    const item = toRecord(rawItem);
    return {
      label,
      value: toText(item.type) || '物品',
      description: toText(item.desc),
      quantity: toText(item.quantity),
    };
  });

  return makeSection('items', '持有物品', entries);
};

const makeAbilitySection = (abilities: unknown): StatusCompanionSection | null => {
  if (_.isArray(abilities)) {
    return makeSection(
      'abilities',
      '能力',
      abilities
        .map(ability => {
          const value = toText(ability);
          return { label: value, value };
        })
        .filter(entry => entry.value),
    );
  }

  return makeSection('abilities', '能力', mapKeyValueEntries(abilities));
};

const makeSoulSection = (souls: unknown): StatusCompanionSection | null => {
  const entries = _.toPairs(toRecord(souls)).map(([label, rawSoul]) => {
    const soul = toRecord(rawSoul);
    return {
      label,
      value: toText(soul.desc) || '未知灵魂',
      children: mapKeyValueEntries(soul.灵魂能力),
    };
  });

  return makeSection('souls', '可用灵魂', entries);
};

const makePostureSection = (posture: string): StatusCompanionSection | null => {
  return posture ? makeSection('posture', '姿态动作', [{ label: '当前', value: posture }]) : null;
};

const getUserName = (statusData: RawStatusData): string => {
  return _.keys(statusData.主要角色).find(name => name !== '白' && name !== '澪') ?? '';
};

const makeBaseProfile = (options: {
  id: StatusCompanionId;
  name: string;
  theme: StatusCompanionTheme;
  character: UnknownRecord;
  joined?: boolean;
  locked?: boolean;
  mystery?: boolean;
  portrait?: string;
  avatar?: string;
  placeholder?: string;
  summary?: string[];
  metrics?: StatusCompanionEntry[];
  extraSections?: Array<StatusCompanionSection | null>;
}): StatusCompanionProfile => {
  const status = toTextList(options.character.当前状态);
  const posture = toText(options.character.姿态动作);
  return {
    id: options.id,
    name: options.name,
    theme: options.theme,
    joined: options.joined ?? true,
    locked: options.locked ?? false,
    mystery: options.mystery ?? false,
    portrait: options.portrait,
    avatar: options.avatar,
    placeholder: options.placeholder ?? '?',
    roles: toTextList(options.character.身份),
    status,
    summary: options.summary ?? [],
    metrics: options.metrics ?? [],
    posture,
    sections: compactSections([
      makePostureSection(posture),
      ...makeAppearanceSections(options.character.外观),
      makeItemSection(options.character.持有物品),
      makeAbilitySection(options.character.能力),
      ...(options.extraSections ?? []),
    ]),
  };
};

export const buildUserCompanionProfile = (statusData: RawStatusData): StatusCompanionProfile => {
  const userName = getUserName(statusData);
  const character = toRecord(userName ? statusData.主要角色[userName as keyof typeof statusData.主要角色] : {});
  const status = toTextList(character.当前状态);

  return makeBaseProfile({
    id: 'user',
    name: userName || '探索者',
    theme: 'traveler',
    character,
    joined: false,
    placeholder: 'U',
    summary: status,
    metrics: compactEntries([
      makeMetric('物品', `${_.keys(toRecord(character.持有物品)).length} 项`),
      makeMetric(
        '能力',
        `${_.isArray(character.能力) ? character.能力.length : _.keys(toRecord(character.能力)).length} 项`,
      ),
    ]),
    extraSections: [],
  });
};

export const buildCompanionProfiles = (statusData: RawStatusData): StatusCompanionProfile[] => {
  const primaryCharacters = statusData.主要角色;
  const specialCharacters = statusData.特殊角色;
  const mio = toRecord(primaryCharacters.澪);
  const shiro = toRecord(primaryCharacters.白);
  const kohina = toRecord(specialCharacters.蛭子小比奈);
  const midori = toRecord(specialCharacters.布施翠);
  const lily = toRecord(specialCharacters.Lily);
  const kohinaJoined = Boolean(kohina.已在队伍);
  const midoriJoined = Boolean(midori.已在队伍);
  const lilyJoined = Boolean(lily.已在队伍);

  return [
    makeBaseProfile({
      id: 'mio',
      name: '澪',
      theme: 'mio',
      character: mio,
      portrait: mioPortrait,
      avatar: mioAvatar,
      metrics: compactEntries([
        makeMetric('好感度', mio.好感度),
        makeMetric('治愈进度', mio.治愈进度),
        makeMetric('星尘稳定剂', mio.注入星尘稳定剂 ? '已注入' : '未注入'),
      ]),
    }),
    makeBaseProfile({
      id: 'shiro',
      name: '白',
      theme: 'shiro',
      character: {
        ...toRecord(redactDivineText(shiro)),
        能力: ['???', '???', '???', '???'],
      },
      portrait: shiroPortrait,
      avatar: shiroAvatar,
      metrics: compactEntries([makeMetric('关注度', shiro.关注度)]),
    }),
    makeBaseProfile({
      id: 'kohina',
      name: '蛭子小比奈',
      theme: 'kohina',
      character: kohina,
      joined: kohinaJoined,
      locked: !kohinaJoined,
      portrait: kohinaPortrait,
      avatar: kohinaAvatar,
      metrics: compactEntries([
        makeMetric('因子', kohina.因子),
        makeMetric('认可度', kohina.认可度),
        makeMetric('模因侵蚀率', kohina.模因侵蚀率),
      ]),
    }),
    makeBaseProfile({
      id: 'midori',
      name: '布施翠',
      theme: 'midori',
      character: midori,
      joined: midoriJoined,
      locked: !midoriJoined,
      portrait: midoriPortrait,
      avatar: midoriAvatar,
      metrics: compactEntries([
        makeMetric('因子', midori.因子),
        makeMetric('依赖度', midori.依赖度),
        makeMetric('模因侵蚀率', midori.模因侵蚀率),
      ]),
    }),
    makeBaseProfile({
      id: 'lily',
      name: 'Lily',
      theme: 'lily',
      character: lily,
      joined: lilyJoined,
      locked: true,
      mystery: true,
      placeholder: '?',
      metrics: compactEntries([makeMetric('好感度', lily.好感度), makeMetric('污秽侵蚀度', lily.污秽侵蚀度)]),
      extraSections: [makeSoulSection(lily.可用灵魂)],
    }),
  ];
};
