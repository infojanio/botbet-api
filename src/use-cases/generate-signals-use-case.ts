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

    const matches = await prisma.match.findMany({
      where: {
        date: { gte: today, lte: tomorrow },
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
        // 📊 Busca últimos jogos de casa / fora
        const homeRecent = await this.api.getRecentMatches(homeTeam.name, 5)
        const awayRecent = await this.api.getRecentMatches(awayTeam.name, 5)
        const h2h = await this.api.getHeadToHead(
          homeTeam.name,
          awayTeam.name,
          5,
        )

        if (!match.externalId) {
          console.warn(`⚠️ Partida sem externalId válido: ${match.id}`)
          continue
        }

        // 🔸 Estatísticas do jogo (xG, posse, chutes, escanteios, cartões)
        const stats = await this.api.getMatchStatistics(match.externalId)

        const hasStats =
          stats &&
          stats.response &&
          Array.isArray(stats.response.stats) &&
          stats.response.stats.length > 0

        if (
          (!homeRecent.length || homeRecent.length === 0) &&
          (!awayRecent.length || awayRecent.length === 0) &&
          (!h2h.length || h2h.length === 0) &&
          !hasStats
        ) {
          console.log(
            `⚠️ Sem dados suficientes para ${homeTeam.name} x ${awayTeam.name}`,
          )
          continue
        }

        // 🔍 Análise separada por time + estatísticas
        const metrics = this.analyzePatterns(homeRecent, awayRecent, h2h, stats)

        // 🎯 Gera sinais com base nas métricas compostas
        const entries = this.generateEntries(
          match.id,
          league?.name ?? 'Desconhecida',
          homeTeam.name,
          awayTeam.name,
          metrics,
        )

        for (const e of entries) {
          await prisma.signal.upsert({
            where: { matchId_type: { matchId: match.id, type: e.type } },
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

  // 🔍 Análise detalhada: gols, BTTS, escanteios, cartões, posse e xG
  private analyzePatterns(
    homeMatches: any[],
    awayMatches: any[],
    h2hMatches: any[],
    stats: any,
  ) {
    const all = [...homeMatches, ...awayMatches, ...h2hMatches]
    if (all.length === 0 && !stats) return null

    // ✅ Define tipo explícito com campos opcionais
    type Metrics = {
      mediaGols: number
      media1T: number
      probOver25: number
      probBTTS: number
      mediaEscanteios: number
      mediaCartoes: number
      expectedGoals?: number
      posse?: number
      chutes?: number
    }

    let golsTotais = 0
    let golsPrimeiroTempo = 0
    let jogosOver25 = 0
    let jogosBTTS = 0
    let escanteios = 0
    let amarelos = 0
    let vermelhos = 0

    for (const m of all) {
      const homeGols = Number(m.homeScore || 0)
      const awayGols = Number(m.awayScore || 0)
      const total = homeGols + awayGols
      const firstHalfGoals =
        Number(m.firstHalfHomeGoals || 0) + Number(m.firstHalfAwayGoals || 0)

      golsTotais += total
      golsPrimeiroTempo += firstHalfGoals
      if (total >= 3) jogosOver25++
      if (homeGols > 0 && awayGols > 0) jogosBTTS++

      escanteios += Number(m.corners?.home || 0) + Number(m.corners?.away || 0)
      amarelos +=
        Number(m.yellowCards?.home || 0) + Number(m.yellowCards?.away || 0)
      vermelhos += Number(m.redCards?.home || 0) + Number(m.redCards?.away || 0)
    }

    const totalJogos = all.length || 1

    const metrics: Metrics = {
      mediaGols: golsTotais / totalJogos,
      media1T: golsPrimeiroTempo / totalJogos,
      probOver25: (jogosOver25 / totalJogos) * 100,
      probBTTS: (jogosBTTS / totalJogos) * 100,
      mediaEscanteios: escanteios / totalJogos,
      mediaCartoes: (amarelos + vermelhos) / totalJogos,
    }

    // ✅ Adiciona estatísticas da API (se disponíveis)
    if (stats) {
      const xGHome = stats?.home?.expectedGoals || 0
      const xGAway = stats?.away?.expectedGoals || 0
      const posseHome = stats?.home?.possession || 50
      const posseAway = stats?.away?.possession || 50
      const chutesHome = stats?.home?.shotsOnTarget || 0
      const chutesAway = stats?.away?.shotsOnTarget || 0

      metrics.expectedGoals = xGHome + xGAway
      metrics.posse = (posseHome + posseAway) / 2
      metrics.chutes = chutesHome + chutesAway
    }

    return metrics
  }

  // 🎯 Geração de sinais avançados
  private generateEntries(
    matchId: number,
    league: string,
    home: string,
    away: string,
    m: any,
  ) {
    const entries: any[] = []
    if (!m) return entries

    // 🔸 Peso composto: histórico (70%) + estatísticas atuais (30%)
    const mix = (hist: number, stat: number) =>
      Math.min(100, hist * 0.7 + stat * 0.3)

    // --- Over 2.5 gols
    if (m.probOver25 >= 60 || (m.expectedGoals ?? 0) > 2.2) {
      const conf = mix(m.probOver25, (m.expectedGoals ?? 0) * 40)
      entries.push({
        matchId,
        type: 'OVER_2_5',
        confidence: conf,
        description: `Alta chance de +2.5 gols (xG ${
          m.expectedGoals?.toFixed(2) ?? '–'
        })`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // --- Ambas marcam
    if (m.probBTTS >= 55 && (m.expectedGoals ?? 0) > 1.5) {
      const conf = mix(m.probBTTS, (m.expectedGoals ?? 0) * 30)
      entries.push({
        matchId,
        type: 'BTTS_YES',
        confidence: conf,
        description: `Ambas marcam provável (${conf.toFixed(1)}%)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // --- Gol no 1º tempo (sem aleatoriedade)
    if (m.media1T >= 1.0 || (m.expectedGoals ?? 0) > 1.2) {
      const conf = mix(m.media1T * 50, (m.expectedGoals ?? 0) * 35)
      entries.push({
        matchId,
        type: 'FIRST_HALF_GOAL',
        confidence: conf,
        description: `Probabilidade alta de gol no 1º tempo (${conf.toFixed(
          1,
        )}%)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // --- Escanteios
    if (m.mediaEscanteios >= 8) {
      const conf = mix(m.mediaEscanteios * 8, (m.chutes ?? 0) * 5)
      entries.push({
        matchId,
        type: 'CORNERS_OVER_8',
        confidence: conf,
        description: `Alta média de escanteios (${m.mediaEscanteios.toFixed(
          1,
        )}/jogo)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // --- Cartões
    if (m.mediaCartoes >= 4) {
      const conf = mix(m.mediaCartoes * 10, m.posse < 45 ? 70 : 50)
      entries.push({
        matchId,
        type: 'CARDS_OVER_4_5',
        confidence: conf,
        description: `Jogo quente, média de ${m.mediaCartoes.toFixed(
          1,
        )} cartões por partida`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // --- Tendência ofensiva
    if (m.mediaGols >= 3.0) {
      entries.push({
        matchId,
        type: 'OFFENSIVE_TREND',
        confidence: 85,
        description: `Alta tendência ofensiva (${m.mediaGols.toFixed(
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
