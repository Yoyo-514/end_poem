import { SECONDARY_CHAR_NAMES } from '../../../var_zod_schema/constants';
import type { RawStatusData } from '../../types/status';

export interface StatusEncounterEntry {
  label: string;
  value: string;
  description?: string;
  quantity?: string;
}

export interface StatusEncounterProfile {
  id: string;
  name: string;
  identity: string;
  trustLevel: string;
  appearance: string;
  posture: string;
  avatar?: string;
  portrait?: string;
  items: StatusEncounterEntry[];
  abilities: StatusEncounterEntry[];
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

const toEncounterItems = (items: unknown): StatusEncounterEntry[] => {
  return _.toPairs(toRecord(items))
    .map(([label, rawItem]) => {
      const item = toRecord(rawItem);
      return {
        label,
        value: toText(item.type) || '物品',
        description: toText(item.desc),
        quantity: toText(item.quantity),
      };
    })
    .filter(entry => entry.label);
};

const toEncounterAbilities = (abilities: unknown): StatusEncounterEntry[] => {
  return _.toPairs(toRecord(abilities))
    .map(([label, value]) => ({ label, value: toText(value) }))
    .filter(entry => entry.label && entry.value);
};

export const buildEncounterProfiles = (statusData: RawStatusData): StatusEncounterProfile[] => {
  const secondaryCharacters = toRecord(statusData.次要角色);

  return SECONDARY_CHAR_NAMES.map(name => {
    const character = toRecord(secondaryCharacters[name]);
    if (_.isEmpty(character)) {
      return null;
    }

    return {
      id: name,
      name,
      identity: toText(character.身份) || '身份未记录',
      trustLevel: toText(character.信任值) || '0',
      appearance: toText(character.外观),
      posture: toText(character.姿态动作),
      items: toEncounterItems(character.持有物品),
      abilities: toEncounterAbilities(character.能力),
    } satisfies StatusEncounterProfile;
  }).filter(Boolean) as StatusEncounterProfile[];
};
