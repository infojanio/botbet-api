import 'dotenv/config'
import { makeGenerateSignals } from '../factories/make-generate-signals'
import { prisma } from '../lib/prisma'

async function run() {
  console.log('📊 Iniciando geração de sinais com base nos dados do banco...')

  try {
    const useCase = makeGenerateSignals()

    // 🔹 Executa geração para todos os jogos
    const result = await useCase.execute()

    console.log(`✅ ${result.length} sinais gerados com sucesso!`)
  } catch (err) {
    if (err instanceof Error) {
      console.error('❌ Erro ao gerar sinais:', err.message)
    }
  } finally {
    // ✅ Garante fechamento das conexões Prisma
    await prisma.$disconnect()

    // ✅ Garante que o processo seja finalizado
    process.exit(0)
  }
}

run()
