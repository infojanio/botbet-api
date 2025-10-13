import Fastify from 'fastify'
import { matchesRoutes } from './http/routes/matches-routes'
import { signalsRoutes } from './http/routes/signals-routes'
import { statsRoutes } from './http/routes/stats-routes'
import { makeGenerateSignals } from './factories/make-generate-signals'
import cron from 'node-cron'
import { generateSignalsRoutes } from './http/routes/generate-signals-routes'
import { generateLiveSignalsRoutes } from './http/routes/generate-live-signals-routes'
import { generateLiveEarlyGoalsRoutes } from './http/routes/generate-live-early-goals-routes'
import { analyzeRoutes } from './http/routes/analyze-routes'
import { teamsRoutes } from './http/routes/teams-routes'
import { filtersRoutes } from './http/routes/filters-routes'

const app = Fastify({ logger: true })

app.register(matchesRoutes)
app.register(signalsRoutes)
app.register(statsRoutes)
app.register(generateLiveSignalsRoutes)
app.register(generateSignalsRoutes)
app.register(generateLiveEarlyGoalsRoutes)

app.register(analyzeRoutes)
app.register(teamsRoutes)
app.register(filtersRoutes)



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
