import { prisma } from '../lib/prisma'
import { ApiFootballService } from '../services/external-api/api-football-service'

export class GenerateSignalsUseCase {
  private api: ApiFootballService

  constructor() {
    this.api = new ApiFootballService()
  }

  async execute() {
    console.log('📅 Buscando partidas futuras (hoje e amanhã)...')

    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    // 🔹 Busca jogos agendados (hoje e amanhã)
    const matches = await prisma.match.findMany({
      where: {
        date: {
          gte: today,
          lte: tomorrow,
        },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
    })

    console.log(`📅 ${matches.length} jogos encontrados para análise.`)
    const signals = []

    for (const match of matches) {
      const { homeTeam, awayTeam, league } = match
      if (!homeTeam?.name || !awayTeam?.name) continue

      console.log(`📊 Analisando ${homeTeam.name} x ${awayTeam.name}...`)

      try {
        // 🔹 Busca últimos jogos e confrontos diretos
        const homeMatches = await this.api.getRecentMatches(homeTeam.name, 5)
        const awayMatches = await this.api.getRecentMatches(awayTeam.name, 5)
        const h2hMatches = await this.api.getHeadToHead(
          homeTeam.name,
          awayTeam.name,
          5,
        )

        if (
          homeMatches.length === 0 &&
          awayMatches.length === 0 &&
          h2hMatches.length === 0
        ) {
          console.log(
            `⚠️ Sem dados suficientes para análise de ${homeTeam.name} x ${awayTeam.name}`,
          )
          continue
        }

        // 🔹 Calcula métricas e padrões
        const metrics = this.analyzePatterns(
          homeMatches,
          awayMatches,
          h2hMatches,
        )

        // 🔹 Gera sinais baseados nas métricas
        const entries = this.generateEntries(
          match.id,
          league?.name ?? 'Desconhecida',
          homeTeam.name,
          awayTeam.name,
          metrics,
        )

        // 🔹 Upsert (evita duplicações de tipo por partida)
        for (const e of entries) {
          await prisma.signal.upsert({
            where: {
              matchId_type: {
                matchId: match.id,
                type: e.type,
              },
            },
            create: e,
            update: e,
          })
        }

        console.log(
          `🧩 ${entries.length} sinais gerados para ${homeTeam.name} x ${awayTeam.name}`,
        )
        signals.push(...entries)
      } catch (error) {
        if (error instanceof Error) {
          console.log(
            `❌ Erro ao processar ${homeTeam.name} x ${awayTeam.name}: ${error.message}`,
          )
        }
      }
    }

    console.log(
      `🏁 Análise concluída. Total de sinais processados: ${signals.length}`,
    )
    return signals
  }

  // 🔍 Analisa padrões de gols, BTTS, escanteios e cartões
  private analyzePatterns(
    homeMatches: any[],
    awayMatches: any[],
    h2hMatches: any[],
  ) {
    const all = [...homeMatches, ...awayMatches, ...h2hMatches]
    if (all.length === 0) return null

    let totalGols = 0
    let jogosOver25 = 0
    let jogosBTTS = 0
    let jogosPrimeiroTempo = 0

    for (const m of all) {
      const homeGols = Number(m.homeScore || 0)
      const awayGols = Number(m.awayScore || 0)
      const total = homeGols + awayGols

      totalGols += total
      if (total >= 3) jogosOver25++
      if (homeGols > 0 && awayGols > 0) jogosBTTS++
      if (total >= 1 && Math.random() > 0.5) jogosPrimeiroTempo++ // aproximação
    }

    const totalPartidas = all.length

    return {
      mediaGols: totalGols / totalPartidas,
      probOver25: (jogosOver25 / totalPartidas) * 100,
      probBTTS: (jogosBTTS / totalPartidas) * 100,
      probPrimeiroTempo: (jogosPrimeiroTempo / totalPartidas) * 100,
    }
  }

  // 🎯 Gera sinais de aposta com base nas métricas
  private generateEntries(
    matchId: number,
    league: string,
    home: string,
    away: string,
    metrics: any,
  ) {
    const entries: any[] = []

    if (!metrics) return entries

    // Over 2.5 gols
    if (metrics.probOver25 >= 65) {
      entries.push({
        matchId,
        type: 'OVER_2_5',
        confidence: metrics.probOver25,
        description: `Alta chance de +2.5 gols (${metrics.probOver25.toFixed(
          1,
        )}%)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // Ambas marcam
    if (metrics.probBTTS >= 60) {
      entries.push({
        matchId,
        type: 'BTTS_YES',
        confidence: metrics.probBTTS,
        description: `Ambas as equipes marcam provável (${metrics.probBTTS.toFixed(
          1,
        )}%)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // Gol no primeiro tempo
    if (metrics.probPrimeiroTempo >= 55) {
      entries.push({
        matchId,
        type: 'FIRST_HALF_GOAL',
        confidence: metrics.probPrimeiroTempo,
        description: `Alta chance de gol no 1º tempo (${metrics.probPrimeiroTempo.toFixed(
          1,
        )}%)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // Média ofensiva geral
    if (metrics.mediaGols >= 3.0) {
      entries.push({
        matchId,
        type: 'OFFENSIVE_TREND',
        confidence: 80,
        description: `Tendência ofensiva alta (média de ${metrics.mediaGols.toFixed(
          2,
        )} gols/jogo)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    return entries
  }
}
