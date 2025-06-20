import { UnknownProposalNumberError } from '@/use-cases/errors/unknown-proposal'
import { makeCreateWorkUseCase } from '@/use-cases/factories/make-create-work-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { string, unknown, z } from 'zod'

export async function createWork(request: FastifyRequest, reply: FastifyReply) {
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
      tipoDias: z.string(),
      equipe: z.string().array().optional(),
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
    disciplinas,
    equipe,
    tipoDias,
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
      equipe,
      tipoDias,
      bearerAuth,
    })
    return await reply.status(201).send({ work })
  } catch (err: unknown) {
    if(err instanceof UnknownProposalNumberError) {
      return await reply.status(400).send({
        error: 'Bad Request',
        message: err.getMessage(),
      })
    }
    else {
      throw err
    }
    //Redundancia de erro, mas é para garantir que o erro seja tratado corretamente
    throw err
  }
}
