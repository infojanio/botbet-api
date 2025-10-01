import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetSignals } from "../../factories/make-get-signals";

export class SignalsController {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const { market, line, selection, competition, from, to, minProb, page, pageSize } = req.query as any;
    const useCase = makeGetSignals();
    const result = await useCase.execute({
      market,
      line: line ? parseFloat(line) : undefined,
      selection,
      competition,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      minProb: minProb ? parseFloat(minProb) : undefined,
      skip: page && pageSize ? (parseInt(page) - 1) * parseInt(pageSize) : 0,
      take: pageSize ? parseInt(pageSize) : 20,
    });
    return reply.send(result);
  }
}
