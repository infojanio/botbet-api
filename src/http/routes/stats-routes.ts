import { FastifyInstance } from "fastify";
import { StatsController } from "../controllers/stats-controller";

const controller = new StatsController();

export async function statsRoutes(app: FastifyInstance) {
  app.get("/stats", (req, reply) => controller.summary(req, reply));
}
