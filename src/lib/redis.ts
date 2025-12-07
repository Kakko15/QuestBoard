import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const createRedisClient = () => {
  if (!redisUrl || !redisToken || redisUrl === 'your_upstash_url_here') {
    return {
      get: async () => null,
      set: async () => null,
      del: async () => null,
    } as any
  }
  return new Redis({
    url: redisUrl,
    token: redisToken,
  })
}

export const redis = createRedisClient()

export const CACHE_KEYS = {
  GUILD_LEADERBOARD: 'guild:leaderboard',
  USER_RANK: (userId: string) => `user:${userId}:rank`,
  GUILD_STATS: (college: string) => `guild:${college}:stats`,
}

export const CACHE_TTL = {
  LEADERBOARD: 60,
  USER_STATS: 300,
  GUILD_STATS: 120,
}

