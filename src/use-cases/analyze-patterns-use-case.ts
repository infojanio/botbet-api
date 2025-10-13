import { ApiFootballService } from '../services/api-football-service'
import { PatternAnalyzerService } from '../services/pattern-analyzer-service'

interface AnalyzeInput {
  home: string
  away: string
  leagueId?: string
  eventId?: string
}

type MatchData = {
  home_score?: number
  away_score?: number
  goals?: { home?: number; away?: number }
  status?: string
  date?: string
  home_name?: string
  away_name?: string
}

const avg = (values: number[]) =>
  values.length
    ? values.reduce((a: number, b: number) => a + b, 0) / values.length
    : 0

export class AnalyzePatternsUseCase {
  constructor(
    private api = new ApiFootballService(),
    private analyzer = new PatternAnalyzerService(),
  ) {}

  async execute({ home, away, leagueId }: AnalyzeInput) {
    console.log(`🔍 Analisando padrão: ${home} x ${away}`)

    // 1) Buscar times
    const homeSearch = await this.api.searchTeamByName(home)
    const awaySearch = await this.api.searchTeamByName(away)

    if (!homeSearch || !awaySearch) {
      throw new Error('Não foi possível encontrar os times na API.')
    }

    const homeId = Number(homeSearch.team_id)
    const awayId = Number(awaySearch.team_id)

    // liga preferida: parâmetro > liga do mandante > liga do visitante
    const leagueToUse = leagueId ?? homeSearch.league_id ?? awaySearch.league_id

    console.log(
      `🏟️ Times encontrados: ${home}(${homeId}) vs ${away}(${awayId})`,
    )
    console.log(`📘 Liga: ${leagueToUse || 'desconhecida'}`)

    // 2) Últimos jogos (AGORA passando opts com teamName e leagueId)
    const homeMatches: MatchData[] = await this.api.getRecentMatches(
      homeId,
      5,
      {
        teamName: homeSearch.team_name ?? home,
        leagueId: leagueToUse,
      },
    )

    const awayMatches: MatchData[] = await this.api.getRecentMatches(
      awayId,
      5,
      {
        teamName: awaySearch.team_name ?? away,
        leagueId: leagueToUse,
      },
    )

    if (!homeMatches.length || !awayMatches.length) {
      throw new Error('Não foi possível obter partidas recentes dos times.')
    }

    // 3) Helpers para extrair gols
    const getGoals = (m: MatchData, side: 'home' | 'away') =>
      side === 'home'
        ? m.home_score ?? m.goals?.home ?? 0
        : m.away_score ?? m.goals?.away ?? 0

    const getConceded = (m: MatchData, side: 'home' | 'away') =>
      side === 'home'
        ? m.away_score ?? m.goals?.away ?? 0
        : m.home_score ?? m.goals?.home ?? 0

    // 4) Médias
    const avgGoalsForHome = avg(homeMatches.map((m) => getGoals(m, 'home')))
    const avgGoalsAgainstHome = avg(
      homeMatches.map((m) => getConceded(m, 'home')),
    )
    const avgGoalsForAway = avg(awayMatches.map((m) => getGoals(m, 'away')))
    const avgGoalsAgainstAway = avg(
      awayMatches.map((m) => getConceded(m, 'away')),
    )

    // 5) Força relativa (média global ~1.4)
    const homeStrength = avgGoalsForHome / 1.4
    const awayStrength = avgGoalsForAway / 1.4

    // 6) Projeção ajustada por contexto (casa/fora + força)
    const { expHome, expAway } = this.analyzer.adjustByContext(
      {
        name: homeSearch.team_name ?? home,
        side: 'HOME',
        avgGoalsFor: avgGoalsForHome,
        avgGoalsAgainst: avgGoalsAgainstHome,
        strength: homeStrength,
      },
      {
        name: awaySearch.team_name ?? away,
        side: 'AWAY',
        avgGoalsFor: avgGoalsForAway,
        avgGoalsAgainst: avgGoalsAgainstAway,
        strength: awayStrength,
      },
    )

    // 7) Relatório final
    const report = this.analyzer.generateReport(
      homeSearch.team_name ?? home,
      awaySearch.team_name ?? away,
      expHome,
      expAway,
    )

    return {
      ...report,
      meta: {
        homeId,
        awayId,
        leagueId: leagueToUse,
      },
      homeStats: {
        avgGoalsFor: avgGoalsForHome.toFixed(2),
        avgGoalsAgainst: avgGoalsAgainstHome.toFixed(2),
      },
      awayStats: {
        avgGoalsFor: avgGoalsForAway.toFixed(2),
        avgGoalsAgainst: avgGoalsAgainstAway.toFixed(2),
      },
      adjusted: {
        expHome: expHome.toFixed(2),
        expAway: expAway.toFixed(2),
      },
    }
  }
}
