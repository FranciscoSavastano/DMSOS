import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { DutyIdNotFoundError } from '@/use-cases/errors/duty-id-not-found-error'
import { makeReadAllUserDutyUseCase } from '@/use-cases/factories/make-read-all-user-duty-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function readAllUserDuty(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const readAllDutiesBodySchema = z.
  object({
    id: z.string(),
  })

  .parse(request.body)

  const readAllDutyHeadersSchema = z
    
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = readAllDutyHeadersSchema
  const {id} = readAllDutiesBodySchema
  try {
    const readAllUserDutyUseCase = makeReadAllUserDutyUseCase()

    const duty = await readAllUserDutyUseCase.execute({ bearerAuth, id })

    return await reply.status(200).send({ duty })
  } catch (err: unknown) {
    if (err instanceof DutyIdNotFoundError) {
      return await reply.status(404).send({ message: err.message })
    }

    if (err instanceof InvalidJwtTokenError) {
      return await reply.status(401).send({ message: err.message })
    }

    throw err
  }
}
