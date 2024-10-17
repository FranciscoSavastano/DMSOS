import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { UserIdNotFoundError } from '@/use-cases/errors/user-id-not-found-error'
import { makeReadAllUserUseCase } from '@/use-cases/factories/make-read-all-user-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function readAllUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateUserHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = updateUserHeadersSchema

  try {
    const readAllUserUseCase = makeReadAllUserUseCase()

    const user = await readAllUserUseCase.execute({ bearerAuth })

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
