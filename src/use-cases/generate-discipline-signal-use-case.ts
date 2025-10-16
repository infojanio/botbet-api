// src/use-cases/signals/generate-discipline-signal-use-case.ts

import { prisma } from '../lib/prisma'

interface DisciplineAnalysisInput {
  matchId: number
  homeStats: { corners: number; yellowCards: number; redCards: number }
  awayStats: { corners: number; yellowCards: number; redCards: number }
}

export class GenerateDisciplineSignalUseCase {
  async execute({ matchId, homeStats, awayStats }: DisciplineAnalysisInput) {
    // 🔹 cálculo de médias
    const totalCorners = homeStats.corners + awayStats.corners
    const totalCards = homeStats.yellowCards + awayStats.yellowCards

    const cornerSignal = this.analyzeCorners(totalCorners)
    const cardSignal = this.analyzeCards(totalCards)

    // 🔹 salvar sinais
    const signals = []

    if (cornerSignal) {
      const s = await prisma.signal.create({
        data: {
          matchId,
          type: 'corners',
          confidence: cornerSignal.confidence,
          description: cornerSignal.reasoning,
        },
      })
      signals.push(s)
    }

    if (cardSignal) {
      const s = await prisma.signal.create({
        data: {
          matchId,
          type: 'cards',
          confidence: cardSignal.confidence,
          description: cardSignal.reasoning,
        },
      })
      signals.push(s)
    }

    return signals
  }

  private analyzeCorners(total: number) {
    if (total >= 10) {
      return {
        confidence: 85,
        reasoning: `Partida com ${total} escanteios — tendência forte de over 9.5`,
      }
    } else if (total >= 7) {
      return {
        confidence: 70,
        reasoning: `Média de ${total} escanteios — padrão favorável a over 7.5`,
      }
    }
    return null
  }

  private analyzeCards(total: number) {
    if (total >= 6) {
      return {
        confidence: 80,
        reasoning: `Partida com alta agressividade (${total} cartões) — tendência over 5.5 cartões`,
      }
    } else if (total >= 4) {
      return {
        confidence: 65,
        reasoning: `Jogo moderado (${total} cartões) — padrão neutro`,
      }
    }
    return null
  }
}
