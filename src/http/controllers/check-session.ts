import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { DutyIdNotFoundError } from '@/use-cases/errors/duty-id-not-found-error'
import { makeDeleteDutyUseCase } from '@/use-cases/factories/make-delete-duty-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { z } from 'zod'

export async function checkSession(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const checkSessionBodySchema = z
    .object({
      id: z.number(),
    })
    .parse(request.body)

  const checkSessionHeaderSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = checkSessionHeaderSchema
  const { id } = checkSessionBodySchema

  try {
    const checkSessionUseCase = checkSessionUseCase()

    await checkSessionUseCase.execute({ id, bearerAuth })
    return await reply.status(200).send()
  } catch (err: unknown) {
    return await reply.status(400).send()
  }
}
