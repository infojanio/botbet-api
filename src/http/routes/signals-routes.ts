import { FastifyInstance } from "fastify";
import { SignalsController } from "../controllers/signals-controller";

const controller = new SignalsController();

export async function signalsRoutes(app: FastifyInstance) {
  app.get("/signals", (req, reply) => controller.list(req, reply));
}
