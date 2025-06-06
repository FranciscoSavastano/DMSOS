import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { WorkIdNotFoundError } from '@/use-cases/errors/work-id-not-found-error'
import { makeReadWorkUseCase } from '@/use-cases/factories/make-read-work-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function readWork(request: FastifyRequest, reply: FastifyReply) {
  const readWorkBodySchema = z
    .object({
      id: z.number(),
    })
    .parse(request.body)

  const readWorkHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)

  const { id } = readWorkBodySchema
  const { authorization: bearerAuth } = readWorkHeadersSchema

  try {
    const readWorkUseCase = makeReadWorkUseCase()
    const work = await readWorkUseCase.execute({ id, bearerAuth })

    return await reply.status(200).send({ work })
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
