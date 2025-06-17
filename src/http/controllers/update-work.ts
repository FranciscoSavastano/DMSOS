import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { DutyIdNotFoundError } from '@/use-cases/errors/duty-id-not-found-error'
import { makeUpdateDutyUseCase } from '@/use-cases/factories/make-update-duty-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { WorkIdNotFoundError } from '@/use-cases/errors/work-id-not-found-error'
import { makeUpdateWorkUseCase } from '@/use-cases/factories/make-update-work-use-case'

export async function updateWork(request: FastifyRequest, reply: FastifyReply) {
  const updateWorkBodySchema = z
    .object({
      id: z.number(),
      data_inicio: z.string().datetime().optional(),
      data_fim: z.string().datetime().optional(),
      horario_rf: z.string().datetime().optional(),
      termino: z.string().datetime().optional(),
    })
    .parse(request.body)

  const updateWorkHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = updateWorkHeadersSchema

  // Valide que as strings nao sao vazias ou nulas.

  try {
    const updateObraUseCase = makeUpdateWorkUseCase()

    const duty = await updateObraUseCase.execute({
      ...updateWorkBodySchema,
      bearerAuth,
    })

    return await reply.status(200).send({ duty })
  } catch (err: unknown) {
    if (err instanceof WorkIdNotFoundError) {
      return await reply.status(404).send({ message: err.message })
    }

    if (err instanceof InvalidJwtTokenError) {
      return await reply.status(401).send({ message: err.message })
    }

    throw err
  }
}
