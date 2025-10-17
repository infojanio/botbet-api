import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetMatches } from "../../factories/make-get-matches";

export async function getMatchesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const useCase = makeGetMatches();

    const from = request.query
      ? new Date(String((request.query as any).from))
      : undefined;

    const to = request.query
      ? new Date(String((request.query as any).to))
      : undefined;

    const limit = (request.query as any)?.limit
      ? Number((request.query as any).limit)
      : 20;

    const matches = await useCase.execute({ from, to, limit });

    return reply.status(200).send(matches);
  } catch (err) {
    console.error("❌ Erro ao buscar partidas:", err);
    return reply.status(500).send({ message: "Erro ao buscar partidas" });
  }
}

