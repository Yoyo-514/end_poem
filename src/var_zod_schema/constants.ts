export const SHIRO_ABILITIES = ['存在即法则', '全知', '概念消除', '泡泡空间'] as const;

export const SECONDARY_CHAR_NAMES = [
  '莉瑟尔·冯·阿尔卡德',
  '艾露薇娅·瑟兰迪尔',
  '理子',
  '露克希娅',
  '青璇',
  '橘奈绪',
  '琥珀',
] as const;

export const getUserName = () => _.trim(SillyTavern.name1);
