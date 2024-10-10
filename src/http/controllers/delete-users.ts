import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { UserIdNotFoundError } from '@/use-cases/errors/user-id-not-found-error'
import { makeDeleteUserUseCase } from '@/use-cases/factories/make-delete-user-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { z } from 'zod'

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  const deleteBodySchema = z
    .object({
      id: z.string(),
    })
    .parse(request.body)

  const readOwnerHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = readOwnerHeadersSchema
  const { id } = deleteBodySchema

  try {
    const deleteUserUseCase = makeDeleteUserUseCase()

    await deleteUserUseCase.execute({ id, bearerAuth })
    return await reply.status(204).send()
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
