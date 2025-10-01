import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetStats } from "../../factories/make-get-stats";

export class StatsController {
  async summary(req: FastifyRequest, reply: FastifyReply) {
    const { from, to, market } = req.query as any;
    const useCase = makeGetStats();
    const result = await useCase.execute({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      market,
    });
    return reply.send(result);
  }
}
