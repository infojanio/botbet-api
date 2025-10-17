import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetMatchDetails } from "../../factories/make-get-match-details";

export async function getMatchDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const useCase = makeGetMatchDetails();

    const match = await useCase.execute(Number(id));

    return reply.status(200).send(match);
  } catch (err) {
    console.error("❌ Erro ao buscar detalhes da partida:", err);
    return reply.status(500).send({ message: "Erro ao buscar detalhes da partida" });
  }
}
