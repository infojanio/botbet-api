import 'dotenv/config'
import Fastify from 'fastify'
import { matchesRoutes } from './http/routes/matches-routes'
import { signalsRoutes } from './http/routes/signals-routes'
import { statsRoutes } from './http/routes/stats-routes'

import { generateSignalsRoutes } from './http/routes/generate-signals-routes'
import { analysisRoutes } from './http/routes/analysis-routes'

const app = Fastify({ logger: true })

app.register(matchesRoutes)
app.register(signalsRoutes)
app.register(statsRoutes)
app.register(generateSignalsRoutes)

app.register(analysisRoutes)
//app.register(reportsRoutes)

const PORT = parseInt(process.env.PORT || '3333')
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`🚀 Bot-Bet API running at ${address}`)
})
