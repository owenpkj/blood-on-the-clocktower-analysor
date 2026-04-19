import type { CausesStatus } from '@/types/game'

// 角色数据类型
interface RoleData {
  id: string
  name_zh: string
  name_en: string
  type: 'townsfolk' | 'outsider' | 'minion' | 'demon'
  ability: string
  affects_setup: boolean
  setup_modification: string | null
  causes_status: CausesStatus | null
}

// 所有角色数据
export const roles: RoleData[] = [
  // ==================== 暗流涌动 - 镇民 ====================
  {
    id: 'washerwoman',
    name_zh: '洗衣妇',
    name_en: 'Washerwoman',
    type: 'townsfolk',
    ability: '在你的首个夜晚，你会得知两名玩家和一个镇民角色：这两名玩家之一是该角色。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'librarian',
    name_zh: '图书管理员',
    name_en: 'Librarian',
    type: 'townsfolk',
    ability: '在你的首个夜晚，你会得知两名玩家和一个外来者角色：这两名玩家之一是该角色。或者你会得知没有外来者在场。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'investigator',
    name_zh: '调查员',
    name_en: 'Investigator',
    type: 'townsfolk',
    ability: '在你的首个夜晚，你会得知两名玩家和一个爪牙角色：这两名玩家之一是该角色。或者你会得知没有爪牙在场。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'chef',
    name_zh: '厨师',
    name_en: 'Chef',
    type: 'townsfolk',
    ability: '在你的首个夜晚，你会得知场上邻座的邪恶玩家有多少对。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'empath',
    name_zh: '共情者',
    name_en: 'Empath',
    type: 'townsfolk',
    ability: '从第一个夜晚开始，你会得知你左右邻座并且存活的玩家中邪恶玩家的数量。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'fortune_teller',
    name_zh: '占卜师',
    name_en: 'Fortune Teller',
    type: 'townsfolk',
    ability: '每个夜晚你选择两名玩家，你会得知他们之中是否有恶魔。会有一名善良玩家被你的能力认定为"恶魔"。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'undertaker',
    name_zh: '送葬者',
    name_en: 'Undertaker',
    type: 'townsfolk',
    ability: '从第二个夜晚开始，你会得知今天白天被处决的玩家的角色。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'monk',
    name_zh: '僧侣',
    name_en: 'Monk',
    type: 'townsfolk',
    ability: '每个夜晚你要选择一名除你之外的玩家，恶魔对他的能力无效。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'ravenkeeper',
    name_zh: '守鸦人',
    name_en: 'Ravenkeeper',
    type: 'townsfolk',
    ability: '如果你在夜晚死亡，你会被唤醒，你选择一名玩家，你得知他的角色。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'virgin',
    name_zh: '贞洁者',
    name_en: 'Virgin',
    type: 'townsfolk',
    ability: '当你首次被提名时，如果提名者是镇民，他可能会被立即处决。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'slayer',
    name_zh: '猎手',
    name_en: 'Slayer',
    type: 'townsfolk',
    ability: '每局游戏一次机会，你可以在白天时公开选择一名玩家：如果他是恶魔，他死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'soldier',
    name_zh: '士兵',
    name_en: 'Soldier',
    type: 'townsfolk',
    ability: '恶魔的负面能力对你无效。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'mayor',
    name_zh: '镇长',
    name_en: 'Mayor',
    type: 'townsfolk',
    ability: '如果只有三名玩家存活且白天没有人被处决，你的阵营获胜。如果你在夜晚即将死亡，可能会有一名其他玩家代替你死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 暗流涌动 - 外来者 ====================
  {
    id: 'butler',
    name_zh: '管家',
    name_en: 'Butler',
    type: 'outsider',
    ability: '从第一个夜晚开始，每个夜晚你要选择一名玩家。白天时，只有他投票了，你才能投票。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'drunk',
    name_zh: '酒鬼',
    name_en: 'Drunk',
    type: 'outsider',
    ability: '你不知道你是酒鬼，你会以为自己是一个镇民角色，但你不是。你持续醉酒。',
    affects_setup: false,
    setup_modification: null,
    causes_status: {
      type: 'drunk',
      target: 'self',
      duration: 'whole_game',
      description: '酒鬼自己整局醉酒，不知道自己是酒鬼，以为自己是某个镇民角色，获得的信息可能是错误的'
    }
  },
  {
    id: 'recluse',
    name_zh: '隐士',
    name_en: 'Recluse',
    type: 'outsider',
    ability: '你可能会被其他玩家当作邪恶阵营、爪牙或者恶魔角色，即使你已经死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'saint',
    name_zh: '圣徒',
    name_en: 'Saint',
    type: 'outsider',
    ability: '如果你被处决，你的阵营失败。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 暗流涌动 - 爪牙 ====================
  {
    id: 'poisoner',
    name_zh: '投毒者',
    name_en: 'Poisoner',
    type: 'minion',
    ability: '每个夜晚，你选择一个玩家，他在当晚和明天白天中毒。',
    affects_setup: false,
    setup_modification: null,
    causes_status: {
      type: 'poisoned',
      target: 'others',
      duration: 'nightly',
      description: '每夜选择一名玩家，该玩家从当夜到次日白天中毒，可每夜更换目标。中毒玩家获得的信息可能是错误的，能力可能无效'
    }
  },
  {
    id: 'spy',
    name_zh: '间谍',
    name_en: 'Spy',
    type: 'minion',
    ability: '每个夜晚，你可以查看说书人的魔典。你可能会被当作善良阵营、镇民或者外来者，即使你已经死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'scarlet_woman',
    name_zh: '红唇女郎',
    name_en: 'Scarlet Woman',
    type: 'minion',
    ability: '如果大于等于5名玩家存活时恶魔死亡，你会变成新的恶魔。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'baron',
    name_zh: '男爵',
    name_en: 'Baron',
    type: 'minion',
    ability: '会有额外的两名外来者加入游戏。',
    affects_setup: true,
    setup_modification: '+2 外来者',
    causes_status: null
  },
  // ==================== 暗流涌动 - 恶魔 ====================
  {
    id: 'imp',
    name_zh: '小恶魔',
    name_en: 'Imp',
    type: 'demon',
    ability: '从第二个夜晚开始，你要选择一名玩家，该玩家死亡。如果你选择了自己，会有一名爪牙变成新的恶魔。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 通用角色 ====================
  {
    id: 'noble',
    name_zh: '贵族',
    name_en: 'Noble',
    type: 'townsfolk',
    ability: '在你的首个夜晚，你会得知三名玩家；其中有且只有一名玩家是邪恶的。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'chambermaid',
    name_zh: '村夫',
    name_en: 'Chambermaid',
    type: 'townsfolk',
    ability: '每个夜晚你选择一个玩家，你得知他的阵营。场上可能会增加0-2名村夫，如果多于1名村夫，会有一个村夫持续醉酒。',
    affects_setup: true,
    setup_modification: '可能增加0-2名村夫',
    causes_status: {
      type: 'drunk',
      target: 'others',
      duration: 'whole_game',
      description: '如果场上有多于1名村夫，其中一个村夫会整局醉酒'
    }
  },
  {
    id: 'oracle',
    name_zh: '神谕者',
    name_en: 'Oracle',
    type: 'townsfolk',
    ability: '从第二个夜晚开始，你会知道有多少死亡玩家是邪恶的。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'seamstress',
    name_zh: '女裁缝',
    name_en: 'Seamstress',
    type: 'townsfolk',
    ability: '每局游戏一次机会，夜晚你可以选择两名除你之外的玩家，你会得知他们是否同一个阵营。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'philosopher',
    name_zh: '哲学家',
    name_en: 'Philosopher',
    type: 'townsfolk',
    ability: '每局游戏一次机会，夜晚你可以选择一个善良角色，你获得该角色的能力。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 初出茅庐 - 特有角色 ====================
  {
    id: 'onmyoji',
    name_zh: '阴阳师',
    name_en: 'Onmyoji',
    type: 'townsfolk',
    ability: '在你的第一个夜晚，你会得知2个善良角色和2个邪恶角色，这4个中有且只有2个角色在场。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'grandmother',
    name_zh: '祖母',
    name_en: 'Grandmother',
    type: 'townsfolk',
    ability: '在你的首个夜晚，你会得知一名善良玩家和他的角色。如果恶魔杀死了他，你也会死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'clockmaker',
    name_zh: '钦天监',
    name_en: 'Clockmaker',
    type: 'townsfolk',
    ability: '在你的首个夜晚，你会得知与你最近的邪恶玩家位于你的那一侧，答案可能有左、右、相同。如果与你临近的玩家中有邪恶玩家，你会得知错误的信息。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'flowergirl',
    name_zh: '卖花女孩',
    name_en: 'Flowergirl',
    type: 'townsfolk',
    ability: '从第二个夜晚开始，你会得知今天白天时，恶魔是否投过票。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'exorcist',
    name_zh: '驱魔人',
    name_en: 'Exorcist',
    type: 'townsfolk',
    ability: '从第二个夜晚开始，你要选择一名和上个夜晚选择的不同的玩家。如果你选中了恶魔，他会知道你是驱魔人，但是他在当晚不会因为他的自身能力被唤醒。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'gambler',
    name_zh: '赌徒',
    name_en: 'Gambler',
    type: 'townsfolk',
    ability: '从第二个夜晚开始，你要选择一个玩家并猜测他的角色。如果你猜错了，你会死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'savant',
    name_zh: '博学者',
    name_en: 'Savant',
    type: 'townsfolk',
    ability: '每个白天可以询问说书人，说书人会提供两条信息，一条是正确的，一条是错误的。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'fisherman',
    name_zh: '渔夫',
    name_en: 'Fisherman',
    type: 'townsfolk',
    ability: '每局游戏一次，你在白天时，可以访问说书人，他会给你提供一些能帮助你的阵营获胜的建议。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'nightwatchman',
    name_zh: '守夜人',
    name_en: 'Nightwatchman',
    type: 'townsfolk',
    ability: '每局游戏一次，在夜晚时，你可以选择一名玩家，他会知道你是守夜人。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'tea_lady',
    name_zh: '茶艺师',
    name_en: 'Tea Lady',
    type: 'townsfolk',
    ability: '如果与你临近的2名存活的玩家是善良的，他们不会死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'fool',
    name_zh: '弄臣',
    name_en: 'Fool',
    type: 'townsfolk',
    ability: '在你第一次要死亡时，你不会死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 初出茅庐 - 外来者 ====================
  {
    id: 'moonchild',
    name_zh: '月之子',
    name_en: 'Moonchild',
    type: 'outsider',
    ability: '在你得知你死亡时，你要选择一名存活的玩家，如果他是善良的，在当晚他会死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'tinker',
    name_zh: '煞星',
    name_en: 'Tinker',
    type: 'outsider',
    ability: '你死亡时，当晚与你邻座的存活玩家之一可能会死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'acrobat',
    name_zh: '杂技演员',
    name_en: 'Acrobat',
    type: 'outsider',
    ability: '从第二个夜晚开始，如果与你临近的存活善良玩家之一醉酒或中毒，你会死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 初出茅庐 - 爪牙 ====================
  {
    id: 'godfather',
    name_zh: '教父',
    name_en: 'Godfather',
    type: 'minion',
    ability: '在你的第一个夜晚，你会知道场上有哪些外来者角色在场。如果有外来者在白天死亡，你会在当晚被唤醒并选择一名玩家，他死亡。如果你在场，初始的配置会+1或者-1名外来者。',
    affects_setup: true,
    setup_modification: '±1 外来者',
    causes_status: null
  },
  {
    id: 'venom_hunter',
    name_zh: '养蛊人',
    name_en: 'Venom Hunter',
    type: 'minion',
    ability: '在你存活时提名你的玩家会在当晚死亡，即使你已经死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'devils_advocate',
    name_zh: '魔鬼代言人',
    name_en: 'Devils Advocate',
    type: 'minion',
    ability: '从第一个夜晚开始，你要选择一名存活玩家，必须选择与上个夜晚不一样的玩家。如果这个玩家在第二个白天被处决，他不会死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 初出茅庐 - 恶魔 ====================
  {
    id: 'nodash',
    name_zh: '诺达鲺',
    name_en: 'Nodash',
    type: 'demon',
    ability: '从第二个夜晚开始，你要选择一名玩家，他死亡。与你临近的2名镇民会中毒。如果你旁边不是镇民，那么中毒的位置会顺移到下一个镇民玩家。',
    affects_setup: false,
    setup_modification: null,
    causes_status: {
      type: 'poisoned',
      target: 'neighbors',
      duration: 'whole_game',
      description: '恶魔邻座的2名镇民整局中毒。如果邻座不是镇民，中毒位置顺延到下一个镇民。中毒玩家获得的信息可能是错误的'
    }
  },
  {
    id: 'taotie',
    name_zh: '饕餮',
    name_en: 'Taotie',
    type: 'demon',
    ability: '从第二个夜晚开始，你要选择任意数量的非旅行者玩家或者一名旅行者玩家。如果你选择的玩家角色类型不相同，他们都死亡。你会导致初始配置时，外来者增加一名。',
    affects_setup: true,
    setup_modification: '+1 外来者',
    causes_status: null
  },
  // ==================== 意气用事 - 特有角色 ====================
  {
    id: 'balloonist',
    name_zh: '气球驾驶员',
    name_en: 'Balloonist',
    type: 'townsfolk',
    ability: '每个夜晚，你会知道与上个夜晚得知玩家角色类型不同的玩家。你会让初始的角色配置中，增加0名或者1名外来者。',
    affects_setup: true,
    setup_modification: '+0或+1 外来者',
    causes_status: null
  },
  {
    id: 'high_priestess',
    name_zh: '女祭司',
    name_en: 'High Priestess',
    type: 'townsfolk',
    ability: '每个夜晚你会得知一名说书人认为你应该与他交流的玩家。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'juggler',
    name_zh: '戏法师',
    name_en: 'Juggler',
    type: 'townsfolk',
    ability: '每个白天，你可以公开猜测谁是爪牙，谁是恶魔，如果你猜对，善良阵营获胜。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'cannibal',
    name_zh: '食人族',
    name_en: 'Cannibal',
    type: 'townsfolk',
    ability: '你获得上个死于处决的玩家的能力，如果上个被处决的玩家是邪恶阵营的，你会中毒直到下个善良玩家被处决。',
    affects_setup: false,
    setup_modification: null,
    causes_status: {
      type: 'poisoned',
      target: 'self',
      duration: 'conditional',
      description: '如果上个被处决的玩家是邪恶阵营，食人族中毒直到下个善良玩家被处决'
    }
  },
  {
    id: 'banshee',
    name_zh: '报丧女妖',
    name_en: 'Banshee',
    type: 'townsfolk',
    ability: '如果恶魔杀死了你，说书人会公告让所有玩家知道。之后每天你可以发起两次提名，你的决策投票算作两票。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 意气用事 - 外来者 ====================
  {
    id: 'puzzlemaster',
    name_zh: '解密大师',
    name_en: 'Puzzlemaster',
    type: 'outsider',
    ability: '你会让一个玩家醉酒，即使你已经死亡。每局游戏一次，你可以猜测谁是那个被你醉酒的玩家，如果你猜对了，你会知道谁是恶魔，如果你猜错了，你会知道错误的谁是恶魔的信息。',
    affects_setup: false,
    setup_modification: null,
    causes_status: {
      type: 'drunk',
      target: 'others',
      duration: 'whole_game',
      description: '解密大师会让另一名玩家整局醉酒，即使解密大师死亡该效果仍然存在'
    }
  },
  {
    id: 'snitch',
    name_zh: '畸形秀演员',
    name_en: 'Snitch',
    type: 'outsider',
    ability: '如果你疯狂表明自己是外来者，你可能被直接处决。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'damsel',
    name_zh: '隐士',
    name_en: 'Damsel',
    type: 'outsider',
    ability: '你同时拥有所有外来者的能力。你会让初始阵营中增加0-1个外来者。',
    affects_setup: true,
    setup_modification: '+0或+1 外来者',
    causes_status: null
  },
  {
    id: 'zealot',
    name_zh: '狂热者',
    name_en: 'Zealot',
    type: 'outsider',
    ability: '如果大于等于五名玩家存活，你必须要在所有的提名处决中投票。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 意气用事 - 爪牙 ====================
  {
    id: 'widow',
    name_zh: '亡魂',
    name_en: 'Widow',
    type: 'minion',
    ability: '你可以在夜晚睁眼，当其他邪恶玩家睁眼，你也会被唤醒。这个角色可以晚上引导其他邪恶的行为。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'wizard',
    name_zh: '巫师',
    name_en: 'Wizard',
    type: 'minion',
    ability: '你可以向说书人许愿，说一个希望生成的新规则，如果说书人实现你的许愿，说书人会让你的阵营付出一定代价并为所有玩家提供线索。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'witch',
    name_zh: '女巫',
    name_en: 'Witch',
    type: 'minion',
    ability: '每个夜晚你要选择一名玩家，如果他白天发起提名，他会死亡。如果只有3名玩家存活，你失去能力。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'brainwasher',
    name_zh: '洗脑师',
    name_en: 'Brainwasher',
    type: 'minion',
    ability: '每个夜晚，你要选择一个玩家和一个善良角色。他明天白天和夜晚需要疯狂地证明自己是这个角色，否则你可能会处决。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 意气用事 - 恶魔 ====================
  {
    id: 'fang_gu',
    name_zh: '方古',
    name_en: 'Fang Gu',
    type: 'demon',
    ability: '从第二个夜晚开始，你可以杀死一名玩家。如果你杀死了外来者，你会死亡，他变成新的方古。整局游戏，只会有一个外来者被转化为方古。你会让初始角色配置增加1名外来者。',
    affects_setup: true,
    setup_modification: '+1 外来者',
    causes_status: null
  },
  {
    id: 'legion',
    name_zh: '提丰之首',
    name_en: 'Legion',
    type: 'demon',
    ability: '从第二个夜晚开始，你可以杀死一名玩家。所有的邪恶玩家一定连坐，并且你坐在中间。你会让初始角色配置增加一名爪牙，并且让外来者数量随机。',
    affects_setup: true,
    setup_modification: '+1 爪牙，外来者随机',
    causes_status: null
  },
  {
    id: 'vortox',
    name_zh: '亡骨魔',
    name_en: 'Vortox',
    type: 'demon',
    ability: '从第二个夜晚开始，你可以杀死一名玩家。被你杀死的爪牙，爪牙会保留他的能力。死亡爪牙身边的两名镇民之一会中毒。',
    affects_setup: false,
    setup_modification: null,
    causes_status: {
      type: 'poisoned',
      target: 'neighbors',
      duration: 'conditional',
      description: '当爪牙被亡骨魔杀死后，该爪牙邻座的两名镇民之一会中毒'
    }
  },
  // ==================== 通用修行者 ====================
  {
    id: 'clockmaker_alt',
    name_zh: '修行者',
    name_en: 'Clockmaker',
    type: 'townsfolk',
    ability: '在你的首个夜晚，你会得知与你最近的邪恶玩家位于你的顺时针方向还是逆时针方向，如果你两侧的邪恶玩家与你的距离相等，你得知的信息由说书人决定。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 杀手往事 - 特有镇民 ====================
  {
    id: 'artist',
    name_zh: '艺术家',
    name_en: 'Artist',
    type: 'townsfolk',
    ability: '每局游戏一次机会，白天你询问说书人一个是非问题，你会得知答案：是/不是/我不知道。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'half_orc',
    name_zh: '半兽人',
    name_en: 'Half Orc',
    type: 'townsfolk',
    ability: '从第二个夜晚开始，你选择一个存活玩家，如果他是善良的，他死亡，但当晚恶魔不会造成死亡。会有一名固定的善良玩家被你当作邪恶阵营。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'pixie',
    name_zh: '小精灵',
    name_en: 'Pixie',
    type: 'townsfolk',
    ability: '在你的第一个夜晚，你会得知一个在场的镇民角色。如果你"疯狂"地证明你是这个镇民角色，那么在他死亡时，你会获得这个角色的能力。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'bureaucrat',
    name_zh: '事务官',
    name_en: 'Bureaucrat',
    type: 'townsfolk',
    ability: '在你的首个夜晚，你会得知一名善良玩家是谁。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'king',
    name_zh: '国王',
    name_en: 'King',
    type: 'townsfolk',
    ability: '每个夜晚判定，如果死亡的玩家数量大于或等于存活的玩家数量，你会得知一个存活的角色。恶魔会知道你是国王。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'choirboy',
    name_zh: '唱诗男孩',
    name_en: 'Choirboy',
    type: 'townsfolk',
    ability: '如果恶魔杀死了国王，你会得知哪个玩家是恶魔。你存在的时候必有一个玩家是国王。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'amnesiac',
    name_zh: '失忆者',
    name_en: 'Amnesiac',
    type: 'townsfolk',
    ability: '你不知道你的能力，由说书人决定。每个白天你可以找说书人猜测一次，说书人会告知你猜测有多准确。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 杀手往事 - 特有外来者 ====================
  {
    id: 'snitch_tk',
    name_zh: '告密者',
    name_en: 'Snitch',
    type: 'outsider',
    ability: '在你的第一个夜晚，所有爪牙会知道3个一定不在场的角色。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'stranger',
    name_zh: '陌客',
    name_en: 'Stranger',
    type: 'outsider',
    ability: '你可能会被其他玩家当作邪恶阵营、爪牙或者恶魔角色，即使你已经死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'ogre',
    name_zh: '食人魔',
    name_en: 'Ogre',
    type: 'outsider',
    ability: '在你的第一个夜晚，你要选择一个除你之外的玩家，你转变为他的阵营，即使你中毒或醉酒。但你不知道自己转变后的阵营。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 杀手往事 - 特有爪牙 ====================
  {
    id: 'harpy',
    name_zh: '鹰身女妖',
    name_en: 'Harpy',
    type: 'minion',
    ability: '每个夜晚，你要选择两名玩家，明天第一名被选择的玩家必须"疯狂"地证明第二名被选择的玩家是邪恶的，否则你们两人可能会有人死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'xian',
    name_zh: '限',
    name_en: 'Xian',
    type: 'minion',
    ability: '在等同于初始外来者数量的夜晚，所有镇民玩家会中毒直到下个黄昏。因为你存在，初始的外来者数量会随机。',
    affects_setup: true,
    setup_modification: '外来者数量随机',
    causes_status: {
      type: 'poisoned',
      target: 'others',
      duration: 'conditional',
      description: '在等同于初始外来者数量的夜晚，所有镇民玩家中毒直到下个黄昏'
    }
  },
  {
    id: 'frankenstein',
    name_zh: '科学怪人',
    name_en: 'Frankenstein',
    type: 'minion',
    ability: '恶魔拥有一个不在场的善良角色能力，即使恶魔中毒或醉酒。你和恶魔都知道获得了哪个善良角色的能力。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 瓦釜雷鸣 - 特有镇民 ====================
  {
    id: 'snake_charmer',
    name_zh: '舞蛇人',
    name_en: 'Snake Charmer',
    type: 'townsfolk',
    ability: '每夜选一名存活玩家：若选中恶魔，你与恶魔交换角色和阵营，恶魔被中毒。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'dreamer',
    name_zh: '筑梦师',
    name_en: 'Dreamer',
    type: 'townsfolk',
    ability: '每夜选一名玩家（不能选自己），得知一个善良角色和一个邪恶角色，其中一个是该玩家的真实角色。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 瓦釜雷鸣 - 特有外来者 ====================
  {
    id: 'lunatic',
    name_zh: '疯子',
    name_en: 'Lunatic',
    type: 'outsider',
    ability: '你以为你是恶魔，但其实你不是。恶魔知道你是疯子以及你每夜选择了哪些玩家。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'mutant',
    name_zh: '畸形秀演员',
    name_en: 'Mutant',
    type: 'outsider',
    ability: '如果你公开暗示或声称自己是外来者，你可能被处决。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'sweetheart',
    name_zh: '心上人',
    name_en: 'Sweetheart',
    type: 'outsider',
    ability: '当你死亡时，一名玩家从此醉酒。',
    affects_setup: false,
    setup_modification: null,
    causes_status: {
      type: 'drunk',
      target: 'other',
      condition: '心上人死亡时触发，说书人选择一名玩家永久醉酒',
      description: '心上人死亡时使一名玩家永久醉酒'
    }
  },
  // ==================== 瓦釜雷鸣 - 特有爪牙 ====================
  {
    id: 'pit_hag',
    name_zh: '麻脸巫婆',
    name_en: 'Pit-Hag',
    type: 'minion',
    ability: '每夜（首夜除外）选一名玩家和一个不在场的角色：该玩家变为该角色。若创造了恶魔，当晚死亡由说书人任意决定。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  // ==================== 瓦釜雷鸣 - 特有恶魔 ====================
  {
    id: 'vigormortis',
    name_zh: '亡骨魔',
    name_en: 'Vigormortis',
    type: 'demon',
    ability: '从第二夜起每夜选一名玩家使其死亡。被你杀死的爪牙保留其能力，并使其一名镇民邻座中毒。[-1外来者]',
    affects_setup: true,
    setup_modification: '-1 外来者',
    causes_status: {
      type: 'poisoned',
      target: 'other',
      condition: '当亡骨魔杀死爪牙时，该爪牙邻座的一名镇民中毒',
      description: '亡骨魔杀死爪牙时使其邻座镇民中毒'
    }
  },
  // ==================== 杀手往事 - 恶魔 ====================
  {
    id: 'yaggababble',
    name_zh: '牙嘎巴卜',
    name_en: 'Yaggababble',
    type: 'demon',
    ability: '在你的首个夜晚，你会得知一段短语。如果你在白天公开说出这个短语，当你说出之后可能会有一名玩家死亡。',
    affects_setup: false,
    setup_modification: null,
    causes_status: null
  },
  {
    id: 'lil_monsta',
    name_zh: '小怪宝',
    name_en: "Lil' Monsta",
    type: 'demon',
    ability: '每个夜晚，所有爪牙会决定哪个玩家照看小怪宝，照看者被视为"恶魔"。从第二个夜晚开始，可能会有一个玩家死亡。初始不会有恶魔，而是多1名爪牙。',
    affects_setup: true,
    setup_modification: '+1 爪牙, 无恶魔',
    causes_status: null
  }
]

export type RoleId = typeof roles[number]['id']
