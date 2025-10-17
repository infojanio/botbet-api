import { PrismaSignalRepository } from '../repositories/prisma/prisma-signal-repository'

interface DisciplineAnalysisInput {
  matchId: number | number
  homeTeam: string
  awayTeam: string
  homeStats: { corners: number; yellowCards: number; redCards: number }
  awayStats: { corners: number; yellowCards: number; redCards: number }
}

export class GenerateDisciplineSignalUseCase {
  private signalRepo = new PrismaSignalRepository()

  async execute({ matchId, homeTeam, awayTeam, homeStats, awayStats }: DisciplineAnalysisInput) {
    const totalCorners = homeStats.corners + awayStats.corners
    const totalCards =
      homeStats.yellowCards +
      awayStats.yellowCards +
      homeStats.redCards +
      awayStats.redCards

    const cornerSignal = this.analyzeCorners(totalCorners)
    const cardSignal = this.analyzeCards(totalCards)

    const signals: any[] = []

    if (cornerSignal) {
      const s = await this.signalRepo.create({
        matchId: Number(matchId),
        homeTeam,
        awayTeam,
        type: 'CORNERS',
        confidence: cornerSignal.confidence,
        status: 'active',
      })
      signals.push(s)
      console.log(`⚽ Sinal gerado: ${cornerSignal.descriptioning}`)
    }

    if (cardSignal) {
      const s = await this.signalRepo.create({
        matchId: Number(matchId),
        homeTeam,
        awayTeam,
        type: 'CARDS',
        confidence: cardSignal.confidence,
        status: 'active',
      })
      signals.push(s)
      console.log(`🟨 Sinal gerado: ${cardSignal.descriptioning}`)
    }

    return signals
  }

  private analyzeCorners(total: number) {
    if (total >= 10) {
      return {
        confidence: 85,
        descriptioning: `Partida com ${total} escanteios — tendência forte de over 9.5`,
      }
    } else if (total >= 7) {
      return {
        confidence: 70,
        descriptioning: `Média de ${total} escanteios — padrão favorável a over 7.5`,
      }
    }
    return null
  }

  private analyzeCards(total: number) {
    if (total >= 6) {
      return {
        confidence: 80,
        descriptioning: `Partida com alta agressividade (${total} cartões) — tendência over 5.5 cartões`,
      }
    } else if (total >= 4) {
      return {
        confidence: 65,
        descriptioning: `Jogo moderado (${total} cartões) — padrão neutro`,
      }
    }
    return null
  }
}
