import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { UserIdNotFoundError } from '@/use-cases/errors/user-id-not-found-error'
import { makeUpdateUserUseCase } from '@/use-cases/factories/make-update-user-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
  
  const updateUserBodySchema = z
    .object({
      id: z.string(),
      nome: z.string().optional(),
      cpf: z.string().optional(),
      password: z.string().optional(),
      is_admin: z.boolean().optional(),
      user_role: z.string().optional(),
      email: z.string().email().optional(),
      is_new: z.boolean().optional()
    })
    .parse(request.body)
    
  const updateUserHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = updateUserHeadersSchema

  // Valide que as strings nao sao vazias ou nulas.
  console.log(updateUserBodySchema)
  try {
    const updateUserUseCase = makeUpdateUserUseCase()

    const user = await updateUserUseCase.execute({
      ...updateUserBodySchema,
      bearerAuth,
    })

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
