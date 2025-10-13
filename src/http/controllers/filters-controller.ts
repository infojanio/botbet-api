import { FastifyRequest, FastifyReply } from 'fastify'
import { makeFiltersUseCase } from '../../factories/make-filters-use-case'
import { z } from 'zod'

export async function filtersController(req: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    type: z.enum(['goals', 'corners', 'cards']),
    min: z.coerce.number(),
    max: z.coerce.number().optional(),
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(10),
  })

  try {
    const { type, min, max, page, limit } = querySchema.parse(req.query)
    const useCase = makeFiltersUseCase()
    const result = await useCase.execute({ type, min, max, page, limit })
    return reply.status(200).send(result)
  } catch (err: any) {
    console.error(err)
    return reply.status(400).send({ message: err.message })
  }
}
