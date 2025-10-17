import { FastifyReply, FastifyRequest } from "fastify";
import { makeGenerateLiveEarlyGoals } from "../../factories/make-generate-live-early-goals";
import { makeGenerateLiveSignals } from "../../factories/make-generate-live-signals";

export async function runAnalysisController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    console.log("🧠 Iniciando job de geração de sinais...");
    const earlyGoals = makeGenerateLiveEarlyGoals();
    const live = makeGenerateLiveSignals();

    await earlyGoals.execute();
    await live.execute();

    return reply.status(200).send({ message: "Análises executadas com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao gerar sinais:", err);
    return reply.status(500).send({ message: "Erro ao gerar sinais" });
  }
}
