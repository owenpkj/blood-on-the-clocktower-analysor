// 角色类型
export type RoleType = 'townsfolk' | 'outsider' | 'minion' | 'demon'

// 状态效果类型
export type StatusEffectType = 'drunk' | 'poisoned'

// 状态持续时间
export type StatusDuration =
  | 'whole_game'      // 整局游戏
  | 'nightly'         // 每夜可更换
  | 'until_death'     // 直到死亡
  | 'conditional'     // 条件性（需看具体描述）

// 状态影响目标
export type StatusTarget =
  | 'self'            // 自己
  | 'others'          // 其他玩家（选择）
  | 'neighbors'       // 邻座玩家

// 角色造成的状态效果
export interface CausesStatus {
  type: StatusEffectType
  target: StatusTarget
  duration: StatusDuration
  description: string  // 具体机制说明
}

// 角色
export interface Role {
  id: string
  name_zh: string
  name_en: string | null
  type: RoleType
  ability: string | null
  affects_setup: boolean
  setup_modification: string | null
  causes_status: CausesStatus | null  // 该角色是否造成醉酒/中毒
}

// 人数配置
export interface PlayerCountConfig {
  townsfolk: number
  outsiders: number
  minions: number
  demons: number
}

// 剧本
export interface Script {
  id: string
  name_zh: string
  name_en: string | null
  description: string | null
  difficulty: string | null
  min_players: number
  max_players: number
  role_ids: string[]
  first_night_order: string[]
  other_night_order: string[]
  player_counts: Record<string, PlayerCountConfig>
  special_rules: Record<string, unknown> | null
}

// 玩家声称
export interface Claim {
  seat: number
  role: string
  info: string
}

// 提名记录
export interface Nomination {
  nominator: number
  nominee: number
  voters: number[]
}

// 每日记录（Store 使用）
export interface DayRecord {
  day: number
  night_deaths: number[]
  claims: Claim[]
  nominations: Nomination[]
  execution: number | null
  my_info: string
}

// 游戏数据
export interface GameData {
  days: DayRecord[]
}

// ========== 以下为 LLM API 使用的类型 ==========

// 发言记录（用于 API）
export interface Speech {
  seatNumber: number
  content: string
}

// 提名详情（用于 API）
export interface NominationDetail {
  nominatorSeat: number
  nominatedSeat: number
  votes: number
  executed: boolean
}

// 死亡记录（用于 API）
export interface DeathRecord {
  seatNumber: number
  cause: string  // 'execution' | 'night_kill' | 'ability' | 'other'
}

// 每日记录（用于 API）
export interface DayRecordForAPI {
  day: number
  speeches: Speech[]
  nominations: NominationDetail[]
  deaths: DeathRecord[]
}

// 夜间信息（我获得的信息，用于 API）
export interface NightInfo {
  night: number
  info: string
}

// 玩家信息（用于 API）
export interface PlayerInfo {
  seatNumber: number
  isAlive: boolean
  claimedRole: string | null
  notes: string
}

// 状态效果详情
export interface StatusEffectDetail {
  type: StatusEffectType
  source: string          // 造成该状态的角色
  duration: string        // 持续时间描述
  days?: number[]         // 如果是临时的，影响哪些天
  reason: string          // 具体原因
}

// 世界模型
export interface WorldModel {
  confidence: number
  roles: Record<number, string>           // 座位号 -> 角色名
  alignments: Record<number, '善良' | '邪恶'>  // 座位号 -> 阵营
  status_effects: Record<number, StatusEffectDetail>  // 座位号 -> 状态效果
  reasoning: string[]
}

// 世界模型缓存
export interface WorldModelsCache {
  day: number
  generated_at: string
  models: WorldModel[]
}

// 游戏状态
export type GameStatus = 'active' | 'completed'

// 游戏
export interface Game {
  id: string
  user_id: string | null
  script_id: string
  player_count: number
  my_seat: number
  my_role: string
  current_day: number
  status: GameStatus
  game_data: GameData | null
  world_models: WorldModelsCache | null
  created_at: string
  updated_at: string
}
