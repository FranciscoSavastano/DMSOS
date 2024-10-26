import { makeCreateOcurrenceTypeUseCase } from '@/use-cases/factories/make-create-ocurrence-types-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { string, z } from 'zod'

export async function createOcurrenceType(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerBodySchema = z
    .object({
      type: z.string(),
      subtypes: z.string().array(),
      contract: z.string()
    })
    .parse(request.body)

  const { type, subtypes, contract } = registerBodySchema

  try {
    const registerOcurrenceTypeCase = makeCreateOcurrenceTypeUseCase()

    const { ocurrence_type } = await registerOcurrenceTypeCase.execute({
      type,
      subtypes,
      contract
    })
    return await reply.status(201).send(ocurrence_type)
  } catch (err: unknown) {
    throw err
  }
}
