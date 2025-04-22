import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { WorkIdNotFoundError } from '@/use-cases/errors/work-id-not-found-error'
import { makeDeleteWorkUseCase } from '@/use-cases/factories/make-delete-work-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { z } from 'zod'

export async function deleteWork(request: FastifyRequest, reply: FastifyReply) {
  const deleteBodySchema = z
    .object({
      id: z.number(),
    })
    .parse(request.body)

  const deleteHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = deleteHeadersSchema
  const { id } = deleteBodySchema

  try {
    const deleteWorkUseCase = makeDeleteWorkUseCase()

    await deleteWorkUseCase.execute({ id, bearerAuth })
    return await reply.status(204).send()
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
