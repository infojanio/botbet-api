import { MatchCache } from '@prisma/client'

export interface IMatchCacheRepository {
  findByDate(date: Date): Promise<MatchCache[]>
  createMany(data: any[]): Promise<void>
}
