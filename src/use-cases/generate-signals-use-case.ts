import { prisma } from '../lib/prisma'
import { ApiFootballService } from '../services/external-api/api-football-service'

export class GenerateSignalsUseCase {
  private api: ApiFootballService

  constructor() {
    this.api = new ApiFootballService()
  }

  async execute(matchId?: number) {
    // 🔹 Busca os jogos do banco (um específico ou todos)
    const matches = matchId
      ? await prisma.match.findMany({
          where: { id: matchId },
          include: { league: true, homeTeam: true, awayTeam: true },
        })
      : await prisma.match.findMany({
          include: { league: true, homeTeam: true, awayTeam: true },
        })

    const signals = []

    for (const match of matches) {
      console.log(
        `📊 Analisando ${match.homeTeam.name} x ${match.awayTeam.name}...`,
      )

      try {
        // ✅ Obtém estatísticas reais do jogo
        const statsData = await this.api.getMatchStatistics(
          Number(match.externalId),
        )

        if (
          !statsData?.response?.stats ||
          !Array.isArray(statsData.response.stats)
        ) {
          console.log(`⚠️ Nenhuma estatística encontrada para ${match.id}`)
          continue
        }

        const stats = statsData.response.stats

        // 🔹 Extrai valores principais
        const possession = this.findStatValue(stats, 'BallPossesion')
        const shotsOnTarget = this.findStatValue(stats, 'ShotsOnTarget')
        const corners = this.findStatValue(stats, 'corners')
        const yellowCards = this.findStatValue(stats, 'yellow_cards')
        const redCards = this.findStatValue(stats, 'red_cards')
        const expectedGoals = this.findStatValue(stats, 'expected_goals')

        // 🔹 Armazena entradas calculadas
        const entries: {
          type: string
          confidence: number
          description: string
          status: string
        }[] = []

        // --- GOLS (xG total)
        const totalXG = expectedGoals.home + expectedGoals.away
        if (totalXG >= 2.5) {
          entries.push({
            type: 'GOALS_OVER_2_5',
            confidence: Math.min(100, totalXG * 35),
            description: `Alta probabilidade de +2.5 gols (xG total: ${totalXG.toFixed(
              2,
            )})`,
            status: 'pending',
          })
        }

        // --- ESCANTEIOS
        const totalCorners = corners.home + corners.away
        if (totalCorners >= 8) {
          entries.push({
            type: 'CORNERS_OVER_8',
            confidence: 80,
            description: `Alta frequência de escanteios (${totalCorners} totais)`,
            status: 'pending',
          })
        }

        // --- CARTÕES
        const totalCards =
          yellowCards.home + yellowCards.away + redCards.home + redCards.away
        if (totalCards >= 5) {
          entries.push({
            type: 'CARDS_OVER_4_5',
            confidence: 70,
            description: `Jogo quente (${totalCards} cartões no total)`,
            status: 'pending',
          })
        }

        // --- POSSE DE BOLA
        if (possession.home > 60) {
          entries.push({
            type: 'FAVORITE_DOMINANCE',
            confidence: 75,
            description: `${match.homeTeam.name} domina a posse (${possession.home}%)`,
            status: 'pending',
          })
        }

        // --- FINALIZAÇÕES NO ALVO
        if (shotsOnTarget.home + shotsOnTarget.away >= 8) {
          entries.push({
            type: 'HIGH_SHOTS_ACTIVITY',
            confidence: 65,
            description: `Partida com muitas finalizações no alvo (${
              shotsOnTarget.home + shotsOnTarget.away
            })`,
            status: 'pending',
          })
        }

        // 🔹 Salva sinais no banco (somente se houver algo)
        for (const e of entries) {
          await prisma.signal.create({
            data: {
              matchId: match.id,
              type: e.type,
              confidence: e.confidence,
              description: e.description,
              status: e.status,
            },
          })
        }

        console.log(
          `🧩 ${entries.length} sinais gerados para ${match.homeTeam.name} x ${match.awayTeam.name}`,
        )
        signals.push(...entries)

        // 💤 Delay para evitar bloqueio da API
        await this.delay(1000)
      } catch (error) {
        console.log(
          `❌ Erro ao processar ${match.homeTeam.name} x ${match.awayTeam.name}:`,
          error instanceof Error ? error.message : error,
        )
        await this.delay(1500)
      }
    }

    console.log('✅ Análise concluída.')
    return signals
  }

  // 🔧 Normaliza o valor estatístico (remove % e texto)
  private parseValue(value: any): number {
    if (!value) return 0
    if (typeof value === 'string') {
      const numeric = value.match(/[\d.]+/)
      return numeric ? parseFloat(numeric[0]) : 0
    }
    return Number(value) || 0
  }

  // 🔍 Busca valor em grupo de estatísticas
  private findStatValue(stats: any[], key: string) {
    for (const group of stats) {
      if (!group.stats) continue
      for (const item of group.stats) {
        if (item.key === key) {
          return {
            home: this.parseValue(item.stats?.[0]),
            away: this.parseValue(item.stats?.[1]),
          }
        }
      }
    }
    return { home: 0, away: 0 }
  }

  // 🕐 Delay auxiliar
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
