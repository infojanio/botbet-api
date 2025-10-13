import { FastifyInstance } from "fastify"
import { GenerateLiveSignalsController } from "../controllers/generate-live-signals-controller"

const controller = new GenerateLiveSignalsController()

export async function generateLiveSignalsRoutes(app: FastifyInstance) {
  app.post("/signals/generate-live", (req, reply) => controller.run(req, reply))
}
