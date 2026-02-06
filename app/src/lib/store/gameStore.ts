import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Script, Role, GameData, DayRecord, Claim, Nomination, WorldModelsCache } from '@/types/game'

interface GameState {
  // 游戏设置
  scriptId: string | null
  script: Script | null
  playerCount: number
  mySeat: number
  myRole: string | null

  // 游戏进行中的数据
  gameId: string | null
  currentDay: number
  gameData: GameData
  worldModels: WorldModelsCache | null

  // 缓存数据
  scripts: Script[]
  roles: Role[]

  // Actions - 设置
  setScript: (script: Script) => void
  setPlayerCount: (count: number) => void
  setMySeat: (seat: number) => void
  setMyRole: (role: string) => void

  // Actions - 游戏
  initGame: (gameId: string) => void
  loadGame: (game: {
    id: string
    script_id: string
    player_count: number
    my_seat: number
    my_role: string
    current_day: number
    game_data: GameData | null
    world_models: WorldModelsCache | null
  }) => void

  // Actions - 每日记录
  setNightDeaths: (day: number, deaths: number[]) => void
  addClaim: (day: number, claim: Claim) => void
  updateClaim: (day: number, seat: number, claim: Partial<Claim>) => void
  removeClaim: (day: number, seat: number) => void
  addNomination: (day: number, nomination: Nomination) => void
  removeNomination: (day: number, index: number) => void
  setExecution: (day: number, seat: number | null) => void
  setMyInfo: (day: number, info: string) => void
  nextDay: () => void

  // Actions - 推理
  setWorldModels: (models: WorldModelsCache) => void

  // Actions - 缓存
  setScripts: (scripts: Script[]) => void
  setRoles: (roles: Role[]) => void

  // Actions - 重置
  reset: () => void
}

const initialGameData: GameData = {
  days: [
    {
      day: 1,
      night_deaths: [],
      claims: [],
      nominations: [],
      execution: null,
      my_info: ''
    }
  ]
}

const getOrCreateDayRecord = (gameData: GameData, day: number): DayRecord => {
  let record = gameData.days.find(d => d.day === day)
  if (!record) {
    record = {
      day,
      night_deaths: [],
      claims: [],
      nominations: [],
      execution: null,
      my_info: ''
    }
    gameData.days.push(record)
    gameData.days.sort((a, b) => a.day - b.day)
  }
  return record
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // 初始状态
      scriptId: null,
      script: null,
      playerCount: 7,
      mySeat: 1,
      myRole: null,
      gameId: null,
      currentDay: 1,
      gameData: initialGameData,
      worldModels: null,
      scripts: [],
      roles: [],

      // Actions - 设置
      setScript: (script) => set({ script, scriptId: script.id }),
      setPlayerCount: (count) => set({ playerCount: count }),
      setMySeat: (seat) => set({ mySeat: seat }),
      setMyRole: (role) => set({ myRole: role }),

      // Actions - 游戏
      initGame: (gameId) => set({
        gameId,
        currentDay: 1,
        gameData: initialGameData,
        worldModels: null
      }),

      loadGame: (game) => set({
        gameId: game.id,
        scriptId: game.script_id,
        playerCount: game.player_count,
        mySeat: game.my_seat,
        myRole: game.my_role,
        currentDay: game.current_day,
        gameData: game.game_data || initialGameData,
        worldModels: game.world_models
      }),

      // Actions - 每日记录
      setNightDeaths: (day, deaths) => set((state) => {
        const newGameData = { ...state.gameData, days: [...state.gameData.days] }
        const record = getOrCreateDayRecord(newGameData, day)
        const index = newGameData.days.findIndex(d => d.day === day)
        newGameData.days[index] = { ...record, night_deaths: deaths }
        return { gameData: newGameData }
      }),

      addClaim: (day, claim) => set((state) => {
        const newGameData = { ...state.gameData, days: [...state.gameData.days] }
        const record = getOrCreateDayRecord(newGameData, day)
        const index = newGameData.days.findIndex(d => d.day === day)
        // 如果已存在该座位的声称，更新它
        const existingIndex = record.claims.findIndex(c => c.seat === claim.seat)
        const newClaims = [...record.claims]
        if (existingIndex >= 0) {
          newClaims[existingIndex] = claim
        } else {
          newClaims.push(claim)
        }
        newGameData.days[index] = { ...record, claims: newClaims }
        return { gameData: newGameData }
      }),

      updateClaim: (day, seat, claimUpdate) => set((state) => {
        const newGameData = { ...state.gameData, days: [...state.gameData.days] }
        const record = getOrCreateDayRecord(newGameData, day)
        const index = newGameData.days.findIndex(d => d.day === day)
        const claimIndex = record.claims.findIndex(c => c.seat === seat)
        if (claimIndex >= 0) {
          const newClaims = [...record.claims]
          newClaims[claimIndex] = { ...newClaims[claimIndex], ...claimUpdate }
          newGameData.days[index] = { ...record, claims: newClaims }
        }
        return { gameData: newGameData }
      }),

      removeClaim: (day, seat) => set((state) => {
        const newGameData = { ...state.gameData, days: [...state.gameData.days] }
        const record = getOrCreateDayRecord(newGameData, day)
        const index = newGameData.days.findIndex(d => d.day === day)
        newGameData.days[index] = {
          ...record,
          claims: record.claims.filter(c => c.seat !== seat)
        }
        return { gameData: newGameData }
      }),

      addNomination: (day, nomination) => set((state) => {
        const newGameData = { ...state.gameData, days: [...state.gameData.days] }
        const record = getOrCreateDayRecord(newGameData, day)
        const index = newGameData.days.findIndex(d => d.day === day)
        newGameData.days[index] = {
          ...record,
          nominations: [...record.nominations, nomination]
        }
        return { gameData: newGameData }
      }),

      removeNomination: (day, nominationIndex) => set((state) => {
        const newGameData = { ...state.gameData, days: [...state.gameData.days] }
        const record = getOrCreateDayRecord(newGameData, day)
        const index = newGameData.days.findIndex(d => d.day === day)
        const newNominations = [...record.nominations]
        newNominations.splice(nominationIndex, 1)
        newGameData.days[index] = { ...record, nominations: newNominations }
        return { gameData: newGameData }
      }),

      setExecution: (day, seat) => set((state) => {
        const newGameData = { ...state.gameData, days: [...state.gameData.days] }
        const record = getOrCreateDayRecord(newGameData, day)
        const index = newGameData.days.findIndex(d => d.day === day)
        newGameData.days[index] = { ...record, execution: seat }
        return { gameData: newGameData }
      }),

      setMyInfo: (day, info) => set((state) => {
        const newGameData = { ...state.gameData, days: [...state.gameData.days] }
        const record = getOrCreateDayRecord(newGameData, day)
        const index = newGameData.days.findIndex(d => d.day === day)
        newGameData.days[index] = { ...record, my_info: info }
        return { gameData: newGameData }
      }),

      nextDay: () => set((state) => {
        const nextDayNum = state.currentDay + 1
        const newGameData = { ...state.gameData, days: [...state.gameData.days] }
        getOrCreateDayRecord(newGameData, nextDayNum)
        return { currentDay: nextDayNum, gameData: newGameData }
      }),

      // Actions - 推理
      setWorldModels: (models) => set({ worldModels: models }),

      // Actions - 缓存
      setScripts: (scripts) => set({ scripts }),
      setRoles: (roles) => set({ roles }),

      // Actions - 重置
      reset: () => set({
        scriptId: null,
        script: null,
        playerCount: 7,
        mySeat: 1,
        myRole: null,
        gameId: null,
        currentDay: 1,
        gameData: initialGameData,
        worldModels: null
      })
    }),
    {
      name: 'botc-game-storage',
      partialize: (state) => ({
        // 只持久化必要的数据
        scriptId: state.scriptId,
        playerCount: state.playerCount,
        mySeat: state.mySeat,
        myRole: state.myRole,
        gameId: state.gameId,
        currentDay: state.currentDay,
        gameData: state.gameData,
        worldModels: state.worldModels
      })
    }
  )
)
