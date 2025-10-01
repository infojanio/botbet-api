import Fastify from 'fastify'
import { matchesRoutes } from './http/routes/matches-routes'
import { signalsRoutes } from './http/routes/signals-routes'
import { statsRoutes } from './http/routes/stats-routes'
import { makeGenerateSignals } from './factories/make-generate-signals'
import cron from 'node-cron'

const app = Fastify({ logger: true })

app.register(matchesRoutes)
app.register(signalsRoutes)
app.register(statsRoutes)

// Schedule job every 6 hours
cron.schedule('0 */6 * * *', async () => {
  const job = makeGenerateSignals()
  await job.execute()
})

const PORT = parseInt(process.env.PORT || '3333')
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`🚀 Bot-Bet API running at ${address}`)
})
