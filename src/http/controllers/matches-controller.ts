import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetMatches } from "../../factories/make-get-matches";
import { makeGetMatchDetails } from "../../factories/make-get-match-details";

export class MatchesController {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const { from, to, market, minProb, limit } = req.query as any;
    const useCase = makeGetMatches();
    const result = await useCase.execute({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      market,
      minProb: minProb ? parseFloat(minProb) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return reply.send(result);
  }

  async details(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const useCase = makeGetMatchDetails();
    const result = await useCase.execute(id);
    if (!result) return reply.status(404).send({ error: "Match not found" });
    return reply.send(result);
  }
}
