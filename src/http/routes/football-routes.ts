import { FastifyInstance } from 'fastify'
import { getLeagues } from '../controllers/leagues-controller'
//import { getTodayMatches } from '../controllers/matches-controller'
//import { getSignals } from '../controllers/signals-controller'
import { getLiveMatches } from '../controllers/live-matches-controller'
import { getMatchAnalysis } from '../controllers/match-analysis-controller'
import { getMatchDisciplineAnalysis } from '../controllers/match-discipline-controller'
import { getHotSignals } from '../controllers/signals-hot-controller'
import { getSignalDetail } from '../controllers/signal-detail-controller'
import { getSignalsStats } from '../controllers/signals-stats-controller'
import { getSignalsHistory } from '../controllers/signals-history-controller'

export async function footballRoutes(app: FastifyInstance) {
  app.get('/leagues', getLeagues)
  //app.get('/matches/today', getTodayMatches)
   app.get('/matches/live', getLiveMatches)
    app.get('/matches/:id/analysis', getMatchAnalysis)
    app.get('/matches/:id/discipline', getMatchDisciplineAnalysis)
  //app.get('/signals', getSignals)
  app.get('/signals/recent', getHotSignals)
  app.get('/signals/:id', getSignalDetail)
    app.get('/signals/stats', getSignalsStats)
     app.get('/signals/history', getSignalsHistory)
}
