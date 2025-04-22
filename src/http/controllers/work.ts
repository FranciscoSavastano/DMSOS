import { makeCreateWorkUseCase } from '@/use-cases/factories/make-create-work-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { string, z } from 'zod'

export async function createWork(request: FastifyRequest, reply: FastifyReply) {
  console.log(request.body)
  const registerBodySchema = z
    .object({
      cliente_id: z.string(),
      gerente_id: z.string(),
      nome: z.string(),
      inicio: z.string(),
      termino: z.string().optional(),
      numproposta: z.string(),
      horas_previstas: z.number(),
      hh_previstas: z.number(),
      disciplinas: z.string().array(),
    })
    .parse(request.body)
    const createWorkHeadersSchema = z
        .object({
          authorization: z.string(),
        })
        .parse(request.headers)
      const { authorization: bearerAuth } = createWorkHeadersSchema
  const {
    cliente_id,
    gerente_id,
    nome,
    inicio,
    termino,
    numproposta,
    horas_previstas,
    hh_previstas,
    disciplinas
  } = registerBodySchema
  try {
    const registerWorkCase = makeCreateWorkUseCase()
    const { work } = await registerWorkCase.execute({
      cliente_id,
      gerente_id,
      nome,
      inicio,
      termino,
      numproposta,
      horas_previstas,
      hh_previstas,
      disciplinas,
      bearerAuth,
    })
    return await reply.status(201).send({ work })
  } catch (err: unknown) {
    throw err
  }
}
