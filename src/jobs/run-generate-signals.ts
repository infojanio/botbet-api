import 'dotenv/config'
import { makeGenerateSignals } from '../factories/make-generate-signals'
import { prisma } from '../lib/prisma'

async function run() {
  console.log('📊 Iniciando geração de sinais com base nos dados do banco...')
  const useCase = makeGenerateSignals()

  const result = await useCase.execute()

  console.log(`✅ ${result.length} sinais gerados com sucesso!`)
  await prisma.$disconnect()
  process.exit(0)
}

run().catch(async (err) => {
  console.error('❌ Erro ao gerar sinais:', err)
  await prisma.$disconnect()
  process.exit(1)
})
