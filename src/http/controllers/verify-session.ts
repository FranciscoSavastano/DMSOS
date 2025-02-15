import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { makeVerifySessionUseCase } from '@/use-cases/factories/make-verify-session-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function verifySession(request: FastifyRequest, reply: FastifyReply) {
  const checkSessionHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = checkSessionHeadersSchema

  // Valide que as strings nao sao vazias ou nulas.

  try {
    const verifySessionUseCase = makeVerifySessionUseCase()
    const user = await verifySessionUseCase.execute({
      bearerAuth,
    })

    return await reply.status(200).send({ user })
  } catch (err: unknown) {
    

    if (err instanceof InvalidJwtTokenError) {
      return await reply.status(401).send({ message: err.message })
    }

    throw err
  }
}
