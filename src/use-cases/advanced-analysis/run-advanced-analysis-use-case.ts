import { prisma } from '../../lib/prisma'
import { ApiFootballService } from '../../services/external-api/api-football-service'
import { calculatePatterns } from './calculate-patterns'
import { generateSignalsFromStats } from './generate-signals-from-stats'

export class RunAdvancedAnalysisUseCase {
  constructor(private api: ApiFootballService) {}

  async execute() {
    console.log('🤖 Iniciando análise avançada Bot-Bet...')

    // Buscar partidas agendadas para hoje e amanhã
    const now = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(now.getDate() + 1)

    const matches = await prisma.match.findMany({
      where: {
        date: {
          gte: now,
          lte: tomorrow,
        },
        status: { in: ['scheduled', 'notstarted'] },
      },
      include: { homeTeam: true, awayTeam: true, league: true },
    })

    if (!matches.length) {
      console.log('⚠️ Nenhuma partida agendada encontrada.')
      return []
    }

    const results = []

    for (const match of matches) {
      console.log(
        `📊 Analisando ${match.homeTeam.name} x ${match.awayTeam.name}...`,
      )

      try {
        // Coleta de estatísticas reais
        if (!match.externalId) continue
        const statsResponse = await this.api.getMatchStatistics(
          String(match.externalId),
        )
        const patterns = calculatePatterns(statsResponse)

        // Geração de sinais
        const signals = await generateSignalsFromStats(match.id, patterns)

        results.push({
          match: `${match.homeTeam.name} x ${match.awayTeam.name}`,
          league: match.league.name,
          patterns,
          signals,
        })
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `❌ Erro ao analisar ${match.homeTeam.name} x ${match.awayTeam.name}:`,
            error.message,
          )
        } else {
          console.error('Erro desconhecido:', error)
        }
      }
    }

    console.log('✅ Análise concluída.')
    return results
  }
}
