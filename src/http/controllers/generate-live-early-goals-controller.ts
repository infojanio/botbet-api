import { FastifyReply, FastifyRequest } from "fastify"
import { makeGenerateLiveEarlyGoals } from "../../factories/make-generate-live-early-goals"

export class GenerateLiveEarlyGoalsController {
  async run(req: FastifyRequest, reply: FastifyReply) {
    const { maxMinute, minGoals, maxFavOdd } = (req.query || {}) as any
    const uc = makeGenerateLiveEarlyGoals()
    await uc.execute({
      maxMinute: maxMinute ? parseInt(maxMinute) : undefined,
      minGoals:  minGoals  ? parseInt(minGoals)  : undefined,
      maxFavOdd: maxFavOdd ? parseFloat(maxFavOdd) : undefined,
    })
    return reply.send({ message: "✅ Live early-goals signals gerados." })
  }
}
