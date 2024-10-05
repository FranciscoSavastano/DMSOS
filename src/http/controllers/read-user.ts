import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { UserIdNotFoundError } from '@/use-cases/errors/user-id-not-found-error'
import { makeReadUserUseCase } from '@/use-cases/factories/make-read-user-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function readUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {

  const readUserBodySchema = z
    .object({
      id: z.string()
    })
    
    .parse(request.body)

  const readUserHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  
  const { id } = readUserBodySchema
  const { authorization: bearerAuth } = readUserHeadersSchema

  try {
    const readUserUseCase = makeReadUserUseCase()
    const user = await readUserUseCase.execute({id, bearerAuth })

    return await reply.status(200).send({ user })
  } catch (err: unknown) {
    if (err instanceof UserIdNotFoundError) {
      return await reply.status(404).send({ message: err.message })
    }

    if (err instanceof InvalidJwtTokenError) {
      return await reply.status(401).send({ message: err.message })
    }

    throw err
  }
}