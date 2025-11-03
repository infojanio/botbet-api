import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaSignalRepository } from '../../repositories/prisma/prisma-signal-repository'
import { GetSignalsByStatusUseCase } from '../../use-cases/get-signals-by-status-use-case'

export async function getSignalsByStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { status } = request.query as { status?: string }

    if (!status) {
      return reply.status(400).send({
        message: 'O parâmetro "status" é obrigatório (ex: pending, validated).',
      })
    }

    const repo = new PrismaSignalRepository()
    const useCase = new GetSignalsByStatusUseCase(repo)
    const data = await useCase.execute(status.toLowerCase())

    return reply.status(200).send({
      status: 'success',
      total: data.length,
      filter: status,
      data,
    })
  } catch (error) {
    console.error('❌ Erro ao listar sinais por status:', error)
    return reply.status(500).send({
      status: 'error',
      message: 'Erro interno ao listar sinais por status.',
    })
  }
}
