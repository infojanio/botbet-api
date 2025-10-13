import { FastifyInstance } from "fastify"
import { GenerateLiveEarlyGoalsController } from "../controllers/generate-live-early-goals-controller"

const controller = new GenerateLiveEarlyGoalsController()

export async function generateLiveEarlyGoalsRoutes(app: FastifyInstance) {
  app.post("/signals/generate-live-early-goals", (req, reply) => controller.run(req, reply))
}
