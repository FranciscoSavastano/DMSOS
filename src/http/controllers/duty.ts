import { makeCreateDutyUseCase } from '@/use-cases/factories/make-create-duty-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { string, z } from 'zod'

export async function createDuty(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z
    .object({
      operadores: z.string().array(),
      data_inicio: z.string().datetime(),
      data_fim: z.string().datetime(),
      horario_rf: z.string().datetime(),
      ocorrencia_desc: z.string().optional(),
      ocorrencia_pm_horario: z.string().datetime().optional(),
      ocorrencia_pm_local: z.string().optional(),
      ocorrencia_pm_observacao: z.string().optional(),
      ocorrencia_pm_acao: z.string().optional(),
    })
    .parse(request.body)

  const {
    operadores,
    data_inicio,
    data_fim,
    horario_rf,
    ocorrencia_desc,
    ocorrencia_pm_horario,
    ocorrencia_pm_local,
    ocorrencia_pm_observacao,
    ocorrencia_pm_acao,
  } = registerBodySchema

  try {
    const registerDutyCase = makeCreateDutyUseCase()
      const { duties, ocurrences } = await registerDutyCase.execute({
      operadores,
      data_inicio,
      data_fim,
      horario_rf,
      ocorrencias : [ { 
        ocorrencia_desc,
        ocorrencia_pm_horario,
        ocorrencia_pm_local,
        ocorrencia_pm_observacao,
        ocorrencia_pm_acao,
      },
    ],
          })
    return await reply.status(201).send({ duties, ocurrences })
  } catch (err: unknown) {
    throw err
  }
}
