import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaSignalRepository } from '../../repositories/prisma/prisma-signal-repository'
import { GetSignalsByResultUseCase } from '../../use-cases/get-signals-by-result-use-case'

export async function getSignalsByResultController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { result } = request.query as { result?: string }

    if (!result) {
      return reply.status(400).send({
        message:
          'O parâmetro "result" é obrigatório (ex: GREEN, RED, PENDING).',
      })
    }

    const repo = new PrismaSignalRepository()
    const useCase = new GetSignalsByResultUseCase(repo)
    const data = await useCase.execute(result.toUpperCase())

    return reply.status(200).send({
      status: 'success',
      total: data.length,
      filter: result,
      data,
    })
  } catch (error) {
    console.error('❌ Erro ao listar sinais por resultado:', error)
    return reply.status(500).send({
      status: 'error',
      message: 'Erro interno ao listar sinais por resultado.',
    })
  }
}
