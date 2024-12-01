import { makeCreateDutyUseCase } from '@/use-cases/factories/make-create-duty-use-case'
import { WriteImages } from '@/use-cases/write-images'
import { CreatePdf } from '@/utils/create-pdf-new'
import multer from 'multer'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { string, z } from 'zod'

export async function createDuty(request: FastifyRequest, reply: FastifyReply) {
  const occurrenceSchema = z.object({
    ocorrencia_desc: z.string().optional().default(''),
    ocorrencia_pm_horario: z.string().datetime().optional(),
    ocorrencia_pm_local: z.string().optional(),
    ocorrencia_pm_observacao: z.string().optional(),
    ocorrencia_pm_acao: z.string().optional(),
  })
  const registerBodySchema = z
    .object({
      operador: z.string(),
      operadoresNome: z.string().array(),
      data_inicio: z.string().datetime(),
      data_fim: z.string().datetime(),
      contrato: z.string(),
      horario_rf: z.string().datetime(),
      imagens: z.any(),
      ocurrence: z.array(occurrenceSchema).optional(),
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
    console.log('gerando pdf')
    CreatePdf(duty)
    return await reply.status(201).send({ duty, ocurrences })
  } catch (err: unknown) {
    throw err
  }
}
