import { FastifyInstance } from "fastify";
import { MatchesController } from "../controllers/matches-controller";

const controller = new MatchesController();

export async function matchesRoutes(app: FastifyInstance) {
  app.get("/matches", (req, reply) => controller.list(req, reply));
  app.get("/matches/:id", (req, reply) => controller.details(req, reply));
}
