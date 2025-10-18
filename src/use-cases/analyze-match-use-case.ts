import { prisma } from '../lib/prisma'
import { ApiFootballService } from '../services/external-api/api-football-service'

export class AnalyzeMatchUseCase {
  constructor(private api: ApiFootballService) {}

  async execute(matchId: number) {
    // 🔍 Busca partida e dados associados
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true, league: true },
    })

    if (!match) throw new Error('Partida não encontrada')

    console.log(
      `⚽ Analisando partida: ${match.homeTeam.name} x ${match.awayTeam.name}`,
    )

    // 🔹 Buscar partidas da liga e filtrar últimas 5 de cada time
    const homeHistory = await this.api.getTeamLastMatches(
      match.homeTeam.externalId!,
      match.leagueId,
    )
    const awayHistory = await this.api.getTeamLastMatches(
      match.awayTeam.externalId!,
      match.leagueId,
    )

    // 🔹 Buscar confrontos diretos (head-to-head)
    const h2h = await this.api.getHeadToHead(
      match.homeTeam.externalId!,
      match.awayTeam.externalId!,
      match.leagueId,
    )

    if (!homeHistory.length && !awayHistory.length && !h2h.length) {
      console.warn(
        `⚠️ Sem histórico suficiente para ${match.homeTeam.name} x ${match.awayTeam.name}`,
      )
      return { match, patterns: [] }
    }

    // 🔹 Calcula padrões e probabilidades
    const patterns = this.calculatePatterns(homeHistory, awayHistory, h2h)

    console.log(`📊 Padrões calculados:`, patterns)

    return { match, patterns }
  }

  private calculatePatterns(
    homeMatches: any[],
    awayMatches: any[],
    h2h: any[],
  ) {
    const all = [...homeMatches, ...awayMatches, ...h2h]

    const patterns = []

    const over25 = this.percent(all, (m) => {
      const homeGoals = m.home?.score ?? 0
      const awayGoals = m.away?.score ?? 0
      return homeGoals + awayGoals > 2
    })

    const btts = this.percent(all, (m) => {
      const homeGoals = m.home?.score ?? 0
      const awayGoals = m.away?.score ?? 0
      return homeGoals > 0 && awayGoals > 0
    })

    const corners = this.percent(all, (m) => {
      const totalCorners = m.stats?.corners ?? m.corners ?? 0
      return totalCorners > 9
    })

    const cards = this.percent(all, (m) => {
      const yellowHome = m.home?.yellow ?? 0
      const yellowAway = m.away?.yellow ?? 0
      const reds = (m.home?.red ?? 0) + (m.away?.red ?? 0)
      return yellowHome + yellowAway + reds >= 5
    })

    // 🔹 Apenas padrões com 60%+ de recorrência
    if (over25 >= 0.6)
      patterns.push({
        type: 'Over 2.5 Gols',
        probability: over25,
        description: 'Tendência de jogos com 3+ gols',
      })

    if (btts >= 0.6)
      patterns.push({
        type: 'Ambas Marcam',
        probability: btts,
        description: 'Alta chance de ambas as equipes marcarem',
      })

    if (corners >= 0.6)
      patterns.push({
        type: 'Mais de 9.5 Escanteios',
        probability: corners,
        description: 'Alta frequência de escanteios nas partidas',
      })

    if (cards >= 0.6)
      patterns.push({
        type: 'Mais de 5 Cartões',
        probability: cards,
        description: 'Partidas com tendência a muitos cartões',
      })

    return patterns
  }

  private percent(matches: any[], filterFn: (m: any) => boolean): number {
    const total = matches.length
    const hits = matches.filter(filterFn).length
    return total ? Number((hits / total).toFixed(2)) : 0
  }
}
