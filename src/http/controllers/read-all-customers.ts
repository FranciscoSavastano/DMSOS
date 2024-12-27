import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { CustIdNotFoundError } from '@/use-cases/errors/cust-id-not-found-error'
import { makeReadAllCustUseCase } from '@/use-cases/factories/make-read-all-cust-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function readAllCust(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateCustHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = updateCustHeadersSchema

  try {
    const readAllCustUseCase = makeReadAllCustUseCase()

    const cust = await readAllCustUseCase.execute({ bearerAuth })

    return await reply.status(200).send({ cust })
  } catch (err: unknown) {
    if (err instanceof CustIdNotFoundError) {
      return await reply.status(404).send({ message: err.message })
    }

    if (err instanceof InvalidJwtTokenError) {
      return await reply.status(401).send({ message: err.message })
    }

    throw err
  }
}
