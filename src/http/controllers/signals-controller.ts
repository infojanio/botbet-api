import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaSignalRepository } from "../../repositories/prisma/prisma-signal-repository";

export async function getSignalsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const repo = new PrismaSignalRepository();
    const signals = await repo.findMany({ where: { status: "active" } });

    return reply.status(200).send(signals);
  } catch (err) {
    console.error("❌ Erro ao listar sinais:", err);
    return reply.status(500).send({ message: "Erro ao listar sinais" });
  }
}

export async function clearSignalsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const repo = new PrismaSignalRepository();
    const active = await repo.findMany({ where: { status: "active" } });

    for (const s of active) {
      await repo.updateStatus(s.id, "archived");
    }

    return reply.status(200).send({ message: "Sinais arquivados com sucesso" });
  } catch (err) {
    console.error("❌ Erro ao limpar sinais:", err);
    return reply.status(500).send({ message: "Erro ao limpar sinais" });
  }
}
