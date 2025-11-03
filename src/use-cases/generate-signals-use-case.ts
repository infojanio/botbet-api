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
      where: { date: { gte: today, lte: tomorrow } },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        stats: true,
      },
    })

    console.log(`📅 ${matches.length} jogos encontrados para análise.`)
    const signals = []

    for (const match of matches) {
      const { homeTeam, awayTeam, league } = match
      if (!homeTeam?.name || !awayTeam?.name) continue

      console.log(`📊 Analisando ${homeTeam.name} x ${awayTeam.name}...`)

      try {
        const homeRecent = await this.api.getRecentMatches(homeTeam.name, 5)
        const awayRecent = await this.api.getRecentMatches(awayTeam.name, 5)
        const h2h = await this.api.getHeadToHead(
          homeTeam.name,
          awayTeam.name,
          5,
        )

        if (!homeRecent?.length && !awayRecent?.length) continue

        const metrics = this.analyzePatterns(homeRecent, awayRecent, h2h)

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
        console.log(
          `❌ Erro ao processar ${homeTeam.name} x ${awayTeam.name}:`,
          error,
        )
      }
    }

    console.log(`🏁 Análise concluída. Total de sinais: ${signals.length}`)
    return signals
  }

  private analyzePatterns(
    homeMatches: any[],
    awayMatches: any[],
    h2hMatches: any[],
  ) {
    const all = [...homeMatches, ...awayMatches, ...h2hMatches]
    if (!all.length) return null

    let golsTotais = 0
    let golsPrimeiroTempo = 0
    let jogosOver25 = 0
    let jogosBTTS = 0
    let escanteios = 0
    let amarelos = 0
    let vermelhos = 0
    let posseAcumulada = 0
    let chutesTotais = 0
    let xgTotal = 0
    let contadorStats = 0

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

      if (m.statistics) {
        const stats = m.statistics
        posseAcumulada +=
          ((Number(stats?.possessionHome) ?? 50) +
            (Number(stats?.possessionAway) ?? 50)) /
          2
        chutesTotais +=
          (stats.shotsOnTargetHome ?? 0) + (stats.shotsOnTargetAway ?? 0)
        xgTotal +=
          (stats.expectedGoalsHome ?? 0) + (stats.expectedGoalsAway ?? 0)
        contadorStats++
      }
    }

    const totalJogos = all.length
    return {
      mediaGols: golsTotais / totalJogos,
      media1T: golsPrimeiroTempo / totalJogos,
      probOver25: (jogosOver25 / totalJogos) * 100,
      probBTTS: (jogosBTTS / totalJogos) * 100,
      mediaEscanteios: escanteios / totalJogos,
      mediaCartoes: (amarelos + vermelhos) / totalJogos,
      posse: contadorStats ? posseAcumulada / contadorStats : 50,
      chutes: contadorStats ? chutesTotais / contadorStats : 7,
      expectedGoals: contadorStats
        ? xgTotal / contadorStats
        : golsTotais / totalJogos,
    }
  }

  private generateEntries(
    matchId: number,
    league: string,
    home: string,
    away: string,
    m: any,
  ) {
    const entries: any[] = []
    if (!m) return entries

    const mix = (a: number, b: number) => Math.min(100, a * 0.7 + b * 0.3)

    // ⚽ +2.5 GOLS
    if (m.probOver25 >= 60 || m.mediaGols >= 2.6) {
      const conf = mix(m.probOver25, (m.expectedGoals ?? 0) * 35)
      entries.push({
        matchId,
        type: 'OVER_2_5',
        confidence: conf,
        description: `Alta chance de +2.5 gols — média ${m.mediaGols.toFixed(
          2,
        )}`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // ⚽ AMBAS MARCAM
    if (m.probBTTS >= 55) {
      const conf = mix(m.probBTTS, m.mediaGols * 10)
      entries.push({
        matchId,
        type: 'BOTH_TEAMS_TO_SCORE',
        confidence: conf,
        description: `Alta probabilidade de ambas marcarem (${conf.toFixed(
          1,
        )}%)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // ⏱️ GOL NO PRIMEIRO TEMPO
    if (m.media1T >= 1.0 || (m.expectedGoals ?? 0) > 1.2) {
      const conf = mix(m.media1T * 50, (m.expectedGoals ?? 0) * 30)
      entries.push({
        matchId,
        type: 'FIRST_HALF_GOAL',
        confidence: conf,
        description: `Alta chance de gol no 1º tempo (${conf.toFixed(1)}%)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // 🟨 CARTÕES
    if (m.mediaCartoes >= 3.5) {
      const conf = Math.min(100, m.mediaCartoes * 15)
      entries.push({
        matchId,
        type: 'CARDS_OVER_4_5',
        confidence: conf,
        description: `Média de ${m.mediaCartoes.toFixed(1)} cartões por jogo`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // 🥅 ESCANTEIOS
    if (m.mediaEscanteios >= 8) {
      const conf = Math.min(100, m.mediaEscanteios * 10)
      entries.push({
        matchId,
        type: 'CORNERS_OVER_8_5',
        confidence: conf,
        description: `Alta média de escanteios (${m.mediaEscanteios.toFixed(
          1,
        )}/jogo)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // 🏠 CASA/EMPATE
    if (m.posse > 55 && m.expectedGoals > 1.6) {
      const conf = mix(m.posse, m.expectedGoals * 20)
      entries.push({
        matchId,
        type: 'HOME_OR_DRAW',
        confidence: conf,
        description: `Mandante dominante (${m.posse.toFixed(1)}% posse)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // ✈️ FORA/EMPATE
    if (m.posse < 45 && m.expectedGoals > 1.6) {
      const conf = mix(100 - m.posse, m.expectedGoals * 25)
      entries.push({
        matchId,
        type: 'AWAY_OR_DRAW',
        confidence: conf,
        description: `Visitante perigoso fora de casa (${conf.toFixed(1)}%)`,
        status: 'pending',
        result: null,
        league,
      })
    }

    // ⚡ TENDÊNCIA OFENSIVA
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
