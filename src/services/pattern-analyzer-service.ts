// src/services/pattern-analyzer-service.ts

/**
 * Serviço de análise estatística baseado em Poisson
 * usado para detectar padrões e gerar probabilidades
 * de eventos (gols, BTTS, etc.).
 */

export class PatternAnalyzerService {
  /**
   * Fatorial simples (necessário para Poisson)
   */
  private factorial(n: number): number {
    if (n <= 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) result *= i
    return result
  }

  /**
   * Distribuição de Poisson
   * λ = média esperada de gols
   * k = número de gols
   */
  private poisson(lambda: number, k: number): number {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k)
  }

  /**
   * Probabilidade de ocorrer +2.5 gols (Over 2.5)
   */
  probOver25(expHome: number, expAway: number): number {
    const lambda = expHome + expAway
    let probUnder = 0
    for (let i = 0; i <= 2; i++) probUnder += this.poisson(lambda, i)
    return 1 - probUnder
  }

  /**
   * Probabilidade de Ambas Marcam (BTTS)
   * considerando distribuições independentes
   */
  probBTTS(expHome: number, expAway: number): number {
    const pHomeScore = 1 - this.poisson(expHome, 0)
    const pAwayScore = 1 - this.poisson(expAway, 0)
    return pHomeScore * pAwayScore
  }

  /**
   * Ajusta expectativa de gols conforme contexto:
   * - força do time
   * - local (casa/fora)
   * - médias ofensivas/defensivas
   */
  adjustByContext(
    homeStats: {
      name: string
      side: 'HOME' | 'AWAY'
      avgGoalsFor: number
      avgGoalsAgainst: number
      strength: number // 1 = normal, >1 = forte, <1 = fraco
    },
    awayStats: {
      name: string
      side: 'HOME' | 'AWAY'
      avgGoalsFor: number
      avgGoalsAgainst: number
      strength: number
    },
  ) {
    // Fator casa/fora (estatística média global)
    const homeAdvantage = 1.12
    const awayPenalty = 0.88

    const expHome =
      homeStats.avgGoalsFor *
      awayStats.avgGoalsAgainst *
      homeStats.strength *
      homeAdvantage

    const expAway =
      awayStats.avgGoalsFor *
      homeStats.avgGoalsAgainst *
      awayStats.strength *
      awayPenalty

    return { expHome, expAway }
  }

  /**
   * Probabilidade de Under 2.5 gols
   */
  probUnder25(expHome: number, expAway: number): number {
    const lambda = expHome + expAway
    let probUnder = 0
    for (let i = 0; i <= 2; i++) probUnder += this.poisson(lambda, i)
    return probUnder
  }

  /**
   * Calcula uma pontuação de confiança (0–1)
   * baseada em múltiplas probabilidades observadas
   */
  confidenceScore(...probs: number[]): number {
    const avg = probs.reduce((a, b) => a + b, 0) / probs.length
    const consistency = 1 - Math.abs(Math.max(...probs) - Math.min(...probs)) // variação menor = mais consistente
    return Math.min(1, avg * consistency)
  }

  /**
   * Gera um pequeno relatório textual de padrões
   */
  generateReport(home: string, away: string, expHome: number, expAway: number) {
    const over25 = this.probOver25(expHome, expAway)
    const btts = this.probBTTS(expHome, expAway)
    const under25 = this.probUnder25(expHome, expAway)
    const conf = this.confidenceScore(over25, btts, under25)

    return {
      summary: `${home} x ${away}`,
      expectedGoals: (expHome + expAway).toFixed(2),
      probOver25: +(over25 * 100).toFixed(1),
      probBTTS: +(btts * 100).toFixed(1),
      probUnder25: +(under25 * 100).toFixed(1),
      confidence: +(conf * 100).toFixed(1),
      suggestion:
        conf > 0.7
          ? 'Alta probabilidade de gols'
          : conf > 0.5
          ? 'Jogo equilibrado, tendência neutra'
          : 'Baixa expectativa de gols',
    }
  }
}
