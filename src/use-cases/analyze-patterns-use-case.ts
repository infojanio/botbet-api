import { ApiFootballService } from '../services/api-football-service'
import { PatternAnalyzerService } from '../services/pattern-analyzer-service'

interface AnalyzeInput {
  home: string
  away: string
  leagueId?: string
  eventId?: string
}

export class AnalyzePatternsUseCase {
  constructor(
    private api = new ApiFootballService(),
    private analyzer = new PatternAnalyzerService(),
  ) {}

  async execute({ home, away }: AnalyzeInput) {
    console.log(`⚙️ Coletando dados reais de ${home} e ${away}`)

    // 🔹 Busca IDs dos times (busca leve usando pesquisa por nome)
    const homeSearch = await this.api.searchTeamByName(home)
    const awaySearch = await this.api.searchTeamByName(away)

    if (!homeSearch || !awaySearch) {
      throw new Error('Não foi possível encontrar os times na API.')
    }

    const homeId = homeSearch.team_key || homeSearch.id
    const awayId = awaySearch.team_key || awaySearch.id

    // 🔹 Últimos jogos dos times
    const homeMatches = await this.api.getRecentMatches(homeId, 5)
    const awayMatches = await this.api.getRecentMatches(awayId, 5)

    if (!homeMatches.length || !awayMatches.length) {
      throw new Error('Não foi possível obter partidas recentes.')
    }

    // 🔹 Médias reais de gols marcados e sofridos

    // definimos um tipo base pra evitar 'any'
    type MatchData = {
      home_score?: number
      away_score?: number
      goals?: { home?: number; away?: number }
    }

    // cálculo com tipagem explícita
    const avgGoalsForHome =
      homeMatches.reduce(
        (sum: number, m: MatchData) =>
          sum + (m.home_score ?? m.goals?.home ?? 0),
        0,
      ) / homeMatches.length

    const avgGoalsAgainstHome =
      homeMatches.reduce(
        (sum: number, m: MatchData) =>
          sum + (m.away_score ?? m.goals?.away ?? 0),
        0,
      ) / homeMatches.length

    const avgGoalsForAway =
      awayMatches.reduce(
        (sum: number, m: MatchData) =>
          sum + (m.away_score ?? m.goals?.away ?? 0),
        0,
      ) / awayMatches.length

    const avgGoalsAgainstAway =
      awayMatches.reduce(
        (sum: number, m: MatchData) =>
          sum + (m.home_score ?? m.goals?.home ?? 0),
        0,
      ) / awayMatches.length

    // 🔹 Ajuste de força relativa (com base na média de gols marcados)
    const homeStrength = avgGoalsForHome / 1.4 // 1.4 = média global
    const awayStrength = avgGoalsForAway / 1.4

    const { expHome, expAway } = this.analyzer.adjustByContext(
      {
        name: home,
        side: 'HOME',
        avgGoalsFor: avgGoalsForHome,
        avgGoalsAgainst: avgGoalsAgainstHome,
        strength: homeStrength,
      },
      {
        name: away,
        side: 'AWAY',
        avgGoalsFor: avgGoalsForAway,
        avgGoalsAgainst: avgGoalsAgainstAway,
        strength: awayStrength,
      },
    )

    // 🔹 Gera o relatório
    const report = this.analyzer.generateReport(home, away, expHome, expAway)

    return {
      ...report,
      homeTeam: home,
      awayTeam: away,
      homeStats: {
        avgGoalsFor: avgGoalsForHome.toFixed(2),
        avgGoalsAgainst: avgGoalsAgainstHome.toFixed(2),
      },
      awayStats: {
        avgGoalsFor: avgGoalsForAway.toFixed(2),
        avgGoalsAgainst: avgGoalsAgainstAway.toFixed(2),
      },
      adjusted: { expHome: expHome.toFixed(2), expAway: expAway.toFixed(2) },
    }
  }
}
