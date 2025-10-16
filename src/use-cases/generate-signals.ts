// src/use-cases/signals/generate-signal-use-case.ts

import { prisma } from '../lib/prisma'

interface GenerateSignalInput {
  matchId: number
  type: string
  confidence: number
  description: string
}

export class GenerateSignal {
  async execute({ matchId, type, confidence, description }: GenerateSignalInput) {
    const signal = await prisma.signal.create({
      data: {
        matchId,
        type,
        confidence,
        description,
      },
    })

    return signal
  }
}
