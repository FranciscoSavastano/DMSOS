import { makeCreateSolicitacaoUseCase } from '@/use-cases/factories/make-create-solicitacao-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { string, z } from 'zod'

export async function createRevisao(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z
    .object({
      plantao: z.number(),
      userid: z.string(),
      nome: z.string(),
      texto: z.string(),
      usertype: z.string()
    })
    .parse(request.body)
    const createDutyHeadersSchema = z
        .object({
          authorization: z.string(),
        })
        .parse(request.headers)
      const { authorization: bearerAuth } = createDutyHeadersSchema
  const {
    plantao,
    userid,
    nome,
    texto,
    usertype,
  } = registerBodySchema
  try {
    const registerSolicitacaoCase = makeCreateSolicitacaoUseCase()
    const { revisao } = await registerSolicitacaoCase.execute({
      plantao,
      userid,
      nome,
      texto,
      usertype,
      bearerAuth
    })
    return await reply.status(201).send({ revisao })
  } catch (err: unknown) {
    throw err
  }
}
