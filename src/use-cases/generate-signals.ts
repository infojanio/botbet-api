// src/use-cases/generate-signals.ts
import { ApiFootballService } from '../services/external-api/api-football-service'
import { PrismaSignalRepository } from '../repositories/prisma/prisma-signal-repository'
import { PrismaMatchRepository } from '../repositories/prisma/prisma-match-repository'

interface GeneratedSignal {
  matchId: number
  leagueId: number
  homeTeam: string
  awayTeam: string
  type: string
  probability: number
  description: string
}

export class GenerateSignalsUseCase {
  constructor(
    private api: ApiFootballService,
    private signalRepo: PrismaSignalRepository,
    private matchRepo: PrismaMatchRepository,
  ) {}

  async execute(): Promise<GeneratedSignal[]> {
    console.log('⚙️  Iniciando geração de sinais...')

    // 1️⃣ Buscar partidas ao vivo
    const liveData = await this.api.getLiveMatches()
    const matches = liveData?.response?.live ?? []

    if (!matches.length) {
      console.log('🚫 Nenhuma partida ao vivo encontrada.')
      return []
    }

    const signals: GeneratedSignal[] = []

    for (const m of matches) {
      const matchId = m.id
      const home = m.home?.name
      const away = m.away?.name
      const leagueId = m.leagueId

      // 2️⃣ Buscar estatísticas
      const statsData = await this.api.getMatchStatistics(String(matchId))
      const stats = statsData?.response?.stats?.[0]?.stats ?? []

      const corners = this.findStat(stats, 'Corners')
      const cards = this.findStat(stats, 'Yellow cards')
      const goals = this.findStat(stats, 'Goals')

      // 3️⃣ Lógica simples para detectar sinais
      if (corners?.total >= 8 && m.status.liveTime?.short === 'HT') {
        signals.push({
          matchId,
          leagueId,
          homeTeam: home,
          awayTeam: away,
          type: 'CORNERS',
          probability: 85,
          description: `Partida com tendência de +9.5 escanteios (${corners.total})`,
        })
      }

      if (cards?.total >= 5 && !m.status.finished) {
        signals.push({
          matchId,
          leagueId,
          homeTeam: home,
          awayTeam: away,
          type: 'CARDS',
          probability: 80,
          description: `Alta incidência de cartões (${cards.total})`,
        })
      }

      if (goals?.total >= 3) {
        signals.push({
          matchId,
          leagueId,
          homeTeam: home,
          awayTeam: away,
          type: 'GOALS',
          probability: 75,
          description: `Jogo com tendência de over 3.5 (${goals.total} gols)`,
        })
      }
    }

    // 4️⃣ Salvar no banco (evitando duplicações)
    for (const s of signals) {
      const existing = await this.signalRepo.findByMatchAndType(s.matchId, s.type)
      if (!existing) {
        await this.signalRepo.create({
          matchId: s.matchId,
          type: s.type,
          probability: s.probability,
          status: 'active',
          awayTeam: s.awayTeam,
          homeTeam: s.homeTeam,
          
        })
      }
    }

    console.log(`✅ ${signals.length} sinais gerados com sucesso.`)
    return signals
  }

  private findStat(stats: any[], title: string) {
    return stats.find((s) => s.title?.toLowerCase().includes(title.toLowerCase()))
  }
}
