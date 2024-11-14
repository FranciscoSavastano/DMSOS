import { makeCreateDutyUseCase } from '@/use-cases/factories/make-create-duty-use-case'
import { CreatePdf } from '@/utils/create-pdf'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { string, z } from 'zod'

export async function createDuty(request: FastifyRequest, reply: FastifyReply) {
  const ocurrenceSchema = z.object({
    descricao: z.string().optional(),
    pm_horario: z.string().datetime().optional(),
    pm_local: z.string().optional(),
    pm_observacao: z.string().optional(),
    pm_acao: z.string().optional(),
  })
  const registerBodySchema = z
    .object({
      operador: z.string(),
      operadoresNome: z.string().array(),
      data_inicio: z.string().datetime(),
      data_fim: z.string().datetime(),
      contrato: z.string(),
      horario_rf: z.string().datetime(),
      ocurrence: z.array(ocurrenceSchema).optional(),
    })
    .parse(request.body)

  const {
    operador,
    operadoresNome,
    data_inicio,
    data_fim,
    contrato,
    horario_rf,
    ocurrence,
  } = registerBodySchema

  try {
    const registerDutyCase = makeCreateDutyUseCase()
    const { duty, ocurrences } = await registerDutyCase.execute({
      operador,
      operadoresNome,
      data_inicio,
      data_fim,
      contrato,
      horario_rf,
      ocurrence,
    })
    CreatePdf(duty)
    console.log(ocurrences)
    return await reply.status(201).send({ duty, ocurrences })
  } catch (err: unknown) {
    throw err
  }
}
