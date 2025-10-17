import { FastifyInstance } from "fastify";
import { getMatchesController } from "../controllers/matches-controller";
import { getMatchDetailsController } from "../controllers/match-details-controller";
import { getSignalsController, clearSignalsController } from "../controllers/signals-controller";
import { runAnalysisController } from "../controllers/analyze-controller";


export async function matchesRoutes(app: FastifyInstance) {
  app.get("/matches", getMatchesController);
  app.get("/matches/:id", getMatchDetailsController);

  app.get("/signals", getSignalsController);
  app.delete("/signals", clearSignalsController);

  app.post("/analysis/run", runAnalysisController);
}
