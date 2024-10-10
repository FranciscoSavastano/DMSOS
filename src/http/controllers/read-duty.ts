import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { DutyIdNotFoundError } from '@/use-cases/errors/duty-id-not-found-error'
import { makeReadDutyUseCase } from '@/use-cases/factories/make-read-duty-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function readDuty(request: FastifyRequest, reply: FastifyReply) {
  const readDutyBodySchema = z
    .object({
      id: z.number(),
    })

    .parse(request.body)

  const readDutyHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)

  const { id } = readDutyBodySchema
  const { authorization: bearerAuth } = readDutyHeadersSchema

  try {
    const readDutyUseCase = makeReadDutyUseCase()
    const duty = await readDutyUseCase.execute({ id, bearerAuth })

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
