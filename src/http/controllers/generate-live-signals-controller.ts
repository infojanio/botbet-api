import { FastifyRequest, FastifyReply } from "fastify"
import { makeGenerateLiveSignals } from "../../factories/make-generate-live-signals"

export class GenerateLiveSignalsController {
  async run(req: FastifyRequest, reply: FastifyReply) {
    const useCase = makeGenerateLiveSignals()
    await useCase.execute()
    return reply.status(200).send({ message: "✅ Live signals processados." })
  }
}