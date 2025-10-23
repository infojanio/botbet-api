import 'dotenv/config'
import { prisma } from '../lib/prisma'
import dayjs from 'dayjs'

async function run() {
  console.log('📈 Atualizando histórico diário de sinais...')

  const today = dayjs().startOf('day').toDate()
  const tomorrow = dayjs().add(1, 'day').startOf('day').toDate()

  // 🔹 Busca sinais atualizados (green/red/void) do dia
  const signals = await prisma.signal.findMany({
    where: {
      status: 'checked',
      createdAt: { gte: today, lt: tomorrow },
    },
  })

  if (signals.length === 0) {
    console.log('⚠️ Nenhum sinal conferido hoje.')
    return
  }

  const total = signals.length
  const greens = signals.filter((s) => s.result === 'green').length
  const reds = signals.filter((s) => s.result === 'red').length
  const voids = signals.filter((s) => s.result === 'void').length
  const accuracy = total > 0 ? (greens / total) * 100 : 0

  // 🔹 Atualiza histórico diário
  await prisma.signalHistory.upsert({
    where: { date: today },
    update: {
      totalSignals: total,
      greens,
      reds,
      voids,
      accuracy,
    },
    create: {
      date: today,
      totalSignals: total,
      greens,
      reds,
      voids,
      accuracy,
    },
  })

  console.log(
    `✅ Histórico atualizado: ${greens}/${total} greens (${accuracy.toFixed(
      1,
    )}%)`,
  )

  await prisma.$disconnect()
  console.log('🏁 Finalizado.')
}

run()
