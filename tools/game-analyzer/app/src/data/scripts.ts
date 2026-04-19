// 剧本数据
export const scripts = [
  {
    id: 'trouble_brewing',
    name_zh: '暗流涌动',
    name_en: 'Trouble Brewing',
    description: '官方第一剧本，适合新手入门。包含基础的醉酒和中毒机制。',
    difficulty: 'beginner',
    min_players: 5,
    max_players: 15,
    role_ids: [
      // 镇民
      'washerwoman', 'librarian', 'investigator', 'chef', 'empath',
      'fortune_teller', 'undertaker', 'monk', 'ravenkeeper', 'virgin',
      'slayer', 'soldier', 'mayor',
      // 外来者
      'butler', 'drunk', 'recluse', 'saint',
      // 爪牙
      'poisoner', 'spy', 'scarlet_woman', 'baron',
      // 恶魔
      'imp'
    ],
    first_night_order: [
      'poisoner', 'washerwoman', 'librarian', 'investigator', 'chef',
      'empath', 'fortune_teller', 'butler', 'spy'
    ],
    other_night_order: [
      'poisoner', 'monk', 'scarlet_woman', 'imp', 'ravenkeeper',
      'empath', 'fortune_teller', 'butler', 'undertaker', 'spy'
    ],
    player_counts: {
      '5': { townsfolk: 3, outsiders: 0, minions: 1, demons: 1 },
      '6': { townsfolk: 3, outsiders: 1, minions: 1, demons: 1 },
      '7': { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
      '8': { townsfolk: 5, outsiders: 1, minions: 1, demons: 1 },
      '9': { townsfolk: 5, outsiders: 2, minions: 1, demons: 1 },
      '10': { townsfolk: 7, outsiders: 0, minions: 2, demons: 1 },
      '11': { townsfolk: 7, outsiders: 1, minions: 2, demons: 1 },
      '12': { townsfolk: 7, outsiders: 2, minions: 2, demons: 1 },
      '13': { townsfolk: 9, outsiders: 0, minions: 3, demons: 1 },
      '14': { townsfolk: 9, outsiders: 1, minions: 3, demons: 1 },
      '15': { townsfolk: 9, outsiders: 2, minions: 3, demons: 1 }
    },
    special_rules: {
      baron_effect: '男爵在场时，外来者数量+2',
      drunk_mechanic: '酒鬼不知道自己是酒鬼，会以为自己是镇民'
    }
  },
  {
    id: 'rookies_first_quest',
    name_zh: '初出茅庐',
    name_en: "Rookie's First Quest",
    description: '社区自制剧本，包含配置变化和连锁死亡机制。',
    difficulty: 'intermediate',
    min_players: 7,
    max_players: 15,
    role_ids: [
      // 镇民
      'onmyoji', 'grandmother', 'noble', 'clockmaker', 'flowergirl',
      'oracle', 'exorcist', 'gambler', 'savant', 'fisherman',
      'nightwatchman', 'tea_lady', 'fool',
      // 外来者
      'drunk', 'moonchild', 'tinker', 'acrobat',
      // 爪牙
      'poisoner', 'godfather', 'venom_hunter', 'devils_advocate',
      // 恶魔
      'imp', 'nodash', 'taotie'
    ],
    first_night_order: [
      'poisoner', 'godfather', 'devils_advocate', 'grandmother', 'noble',
      'onmyoji', 'nightwatchman', 'clockmaker'
    ],
    other_night_order: [
      'poisoner', 'gambler', 'devils_advocate', 'exorcist',
      'imp', 'nodash', 'taotie', 'godfather', 'venom_hunter',
      'acrobat', 'moonchild', 'tinker', 'grandmother',
      'flowergirl', 'oracle', 'nightwatchman'
    ],
    player_counts: {
      '7': { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
      '8': { townsfolk: 5, outsiders: 1, minions: 1, demons: 1 },
      '9': { townsfolk: 5, outsiders: 2, minions: 1, demons: 1 },
      '10': { townsfolk: 7, outsiders: 0, minions: 2, demons: 1 },
      '11': { townsfolk: 7, outsiders: 1, minions: 2, demons: 1 },
      '12': { townsfolk: 7, outsiders: 2, minions: 2, demons: 1 },
      '13': { townsfolk: 9, outsiders: 0, minions: 3, demons: 1 },
      '14': { townsfolk: 9, outsiders: 1, minions: 3, demons: 1 },
      '15': { townsfolk: 9, outsiders: 2, minions: 3, demons: 1 }
    },
    special_rules: {
      godfather_effect: '教父在场时，外来者数量±1',
      taotie_effect: '饕餮在场时，外来者数量+1'
    }
  },
  {
    id: 'irrational_behavior',
    name_zh: '意气用事',
    name_en: 'Irrational Behavior',
    description: '社区自制剧本，包含疯狂机制和复杂的恶魔类型。',
    difficulty: 'intermediate',
    min_players: 7,
    max_players: 15,
    role_ids: [
      // 镇民
      'librarian', 'clockmaker_alt', 'noble', 'fortune_teller', 'balloonist',
      'high_priestess', 'chambermaid', 'monk', 'oracle', 'seamstress',
      'juggler', 'cannibal', 'banshee',
      // 外来者
      'puzzlemaster', 'snitch', 'damsel', 'zealot',
      // 爪牙
      'widow', 'wizard', 'poisoner', 'witch', 'brainwasher',
      // 恶魔
      'fang_gu', 'legion', 'vortox'
    ],
    first_night_order: [
      'legion', 'widow', 'poisoner', 'wizard', 'witch', 'brainwasher',
      'librarian', 'fortune_teller', 'seamstress', 'noble', 'balloonist',
      'chambermaid', 'high_priestess', 'clockmaker_alt'
    ],
    other_night_order: [
      'widow', 'monk', 'poisoner', 'wizard', 'witch', 'brainwasher',
      'fang_gu', 'legion', 'vortox', 'banshee',
      'fortune_teller', 'oracle', 'seamstress', 'balloonist',
      'chambermaid', 'high_priestess'
    ],
    player_counts: {
      '7': { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
      '8': { townsfolk: 5, outsiders: 1, minions: 1, demons: 1 },
      '9': { townsfolk: 5, outsiders: 2, minions: 1, demons: 1 },
      '10': { townsfolk: 7, outsiders: 0, minions: 2, demons: 1 },
      '11': { townsfolk: 7, outsiders: 1, minions: 2, demons: 1 },
      '12': { townsfolk: 7, outsiders: 2, minions: 2, demons: 1 },
      '13': { townsfolk: 9, outsiders: 0, minions: 3, demons: 1 },
      '14': { townsfolk: 9, outsiders: 1, minions: 3, demons: 1 },
      '15': { townsfolk: 9, outsiders: 2, minions: 3, demons: 1 }
    },
    special_rules: {
      madness_mechanic: '疯狂机制：玩家需要证明自己是某个角色',
      fang_gu_effect: '方古在场时，外来者数量+1',
      legion_effect: '提丰之首在场时，爪牙数量+1，外来者随机'
    }
  },
  {
    id: 'trained_killer',
    name_zh: '杀手往事',
    name_en: 'Trained Killer',
    description: '社区自制高难度剧本，包含死亡通知单机制（恶魔按固定顺序击杀）、疯狂机制和小怪宝等复杂角色。',
    difficulty: 'advanced',
    min_players: 7,
    max_players: 15,
    role_ids: [
      // 镇民
      'mayor', 'chambermaid', 'artist', 'half_orc', 'ravenkeeper',
      'monk', 'fortune_teller', 'seamstress', 'pixie', 'bureaucrat',
      'king', 'choirboy', 'amnesiac',
      // 外来者
      'snitch_tk', 'stranger', 'ogre', 'drunk',
      // 爪牙
      'poisoner', 'spy', 'harpy', 'xian', 'frankenstein', 'wizard',
      // 恶魔
      'yaggababble', 'lil_monsta'
    ],
    first_night_order: [
      'frankenstein', 'amnesiac', 'snitch_tk', 'king', 'xian',
      'poisoner', 'wizard', 'harpy', 'yaggababble', 'pixie',
      'fortune_teller', 'seamstress', 'bureaucrat', 'chambermaid',
      'spy', 'ogre'
    ],
    other_night_order: [
      'amnesiac', 'xian', 'poisoner', 'wizard', 'monk', 'harpy',
      'half_orc', 'yaggababble', 'lil_monsta', 'ravenkeeper', 'choirboy',
      'fortune_teller', 'seamstress', 'chambermaid', 'king', 'spy'
    ],
    player_counts: {
      '7': { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
      '8': { townsfolk: 5, outsiders: 1, minions: 1, demons: 1 },
      '9': { townsfolk: 5, outsiders: 2, minions: 1, demons: 1 },
      '10': { townsfolk: 7, outsiders: 0, minions: 2, demons: 1 },
      '11': { townsfolk: 7, outsiders: 1, minions: 2, demons: 1 },
      '12': { townsfolk: 7, outsiders: 2, minions: 2, demons: 1 },
      '13': { townsfolk: 9, outsiders: 0, minions: 3, demons: 1 },
      '14': { townsfolk: 9, outsiders: 1, minions: 3, demons: 1 },
      '15': { townsfolk: 9, outsiders: 2, minions: 3, demons: 1 }
    },
    special_rules: {
      death_notice: '死亡通知单：恶魔按镇民→外来者、从上到下的固定顺序击杀',
      xian_effect: '限在场时，外来者数量随机',
      lil_monsta_effect: '小怪宝在场时，无恶魔，+1爪牙，爪牙每夜决定谁照看小怪宝（谁是恶魔）'
    }
  },
  {
    id: 'catfishing',
    name_zh: '瓦釜雷鸣',
    name_en: 'Catfishing',
    description: '社区自制混合剧本，融合暗流涌动/黯月初升/梦殒春宵等多版角色，包含洗脑师疯狂机制和方古阵营转变机制。',
    difficulty: 'intermediate',
    min_players: 7,
    max_players: 15,
    role_ids: [
      // 镇民
      'investigator', 'chef', 'fortune_teller', 'ravenkeeper', 'grandmother',
      'gambler', 'snake_charmer', 'dreamer', 'savant', 'philosopher',
      'balloonist', 'amnesiac', 'cannibal',
      // 外来者
      'lunatic', 'drunk', 'mutant', 'recluse', 'sweetheart',
      // 爪牙
      'brainwasher', 'pit_hag', 'godfather', 'widow',
      // 恶魔
      'fang_gu', 'vigormortis', 'imp'
    ],
    first_night_order: [
      'amnesiac', 'philosopher', 'lunatic', 'widow', 'snake_charmer',
      'godfather', 'brainwasher', 'investigator', 'chef', 'fortune_teller',
      'grandmother', 'dreamer', 'balloonist'
    ],
    other_night_order: [
      'amnesiac', 'philosopher', 'gambler', 'snake_charmer', 'brainwasher',
      'pit_hag', 'lunatic', 'imp', 'fang_gu', 'vigormortis', 'godfather',
      'sweetheart', 'ravenkeeper', 'grandmother', 'fortune_teller',
      'dreamer', 'balloonist'
    ],
    player_counts: {
      '7': { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
      '8': { townsfolk: 5, outsiders: 1, minions: 1, demons: 1 },
      '9': { townsfolk: 5, outsiders: 2, minions: 1, demons: 1 },
      '10': { townsfolk: 7, outsiders: 0, minions: 2, demons: 1 },
      '11': { townsfolk: 7, outsiders: 1, minions: 2, demons: 1 },
      '12': { townsfolk: 7, outsiders: 2, minions: 2, demons: 1 },
      '13': { townsfolk: 9, outsiders: 0, minions: 3, demons: 1 },
      '14': { townsfolk: 9, outsiders: 1, minions: 3, demons: 1 },
      '15': { townsfolk: 9, outsiders: 2, minions: 3, demons: 1 }
    },
    special_rules: {
      godfather_effect: '教父在场时，外来者数量-1或+1',
      balloonist_effect: '气球驾驶员在场时，可能+1外来者',
      vigormortis_effect: '亡骨魔在场时，外来者数量-1',
      fang_gu_effect: '方古在场时，外来者数量+1',
      cerenovus_mechanic: '洗脑师疯狂机制：被选玩家次日声称不可靠，可能是被迫冒充',
      fang_gu_conversion: '方古阵营转变：外来者被方古杀死后变为邪恶方古，该前外来者声称完全不可信'
    }
  }
] as const

export type ScriptId = typeof scripts[number]['id']
