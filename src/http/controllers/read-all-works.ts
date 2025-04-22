import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { WorkIdNotFoundError } from '@/use-cases/errors/work-id-not-found-error'
import { makeReadAllWorkUseCase } from '@/use-cases/factories/make-read-all-work-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function readAllWorks(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const readAllWorkHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = readAllWorkHeadersSchema

  try {
    const readAllWorkUseCase = makeReadAllWorkUseCase()
    
    const work = await readAllWorkUseCase.execute({ bearerAuth })

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
