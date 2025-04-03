import { makeCreateDutyUseCase } from '@/use-cases/factories/make-create-duty-use-case'
import { WriteImages } from '@/use-cases/write-images'
import { CreatePdf } from '@/utils/create-pdf'
import multer from 'multer'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { string, z } from 'zod'

export async function createDuty(request: FastifyRequest, reply: FastifyReply) {
  console.log(request.body)
  const occurrenceSchema = z.object({
    ocorrencia_desc: z.string().optional().default(''),
    ocorrencia_horario: z.string().datetime().optional(),
    ocorrencia_termino: z.string().datetime().optional(),
    ocorrencia_local: z.string().optional(),
    ocorrencia_responsavel: z.string().optional(),
    ocorrencia_observacao: z.string().optional(),
    ocorrencia_acao: z.string().optional(),
    ocorrencia_tipo: z.string().optional(),
    ocorrencia_data: z.string().datetime().optional(),
  })

  const registerBodySchema = z
    .object({
      operadoresNomes: z.string().array(),
      data_inicio: z.string().datetime(),
      data_fim: z.string().datetime(),
      contrato: z.string().min(1),
      consideracoes: z.string(),
      horario_rf: z.string().datetime(),
      imagens: z.any(),
      ocurrence: z.array(occurrenceSchema).optional(),
      informacoes_adicionais: z.any().optional(),
      operadorIds: z.array(z.string())
    })
    .parse(request.body)
    const createDutyHeadersSchema = z
        .object({
          authorization: z.string(),
        })
        .parse(request.headers)
      const { authorization: bearerAuth } = createDutyHeadersSchema
    
  const {
    operadoresNomes,
    data_inicio,
    data_fim,
    contrato,
    horario_rf,
    ocurrence,
    consideracoes,
    informacoes_adicionais,
    operadorIds
  } = registerBodySchema
  try {
    const registerDutyCase = makeCreateDutyUseCase()
    const { duty, ocurrences } = await registerDutyCase.execute({
      operadoresNomes,
      data_inicio,
      data_fim,
      contrato,
      horario_rf,
      ocurrence,
      consideracoes,
      informacoes_adicionais,
      bearerAuth,
      operadorIds
    })
    CreatePdf(duty, bearerAuth)
    return await reply.status(201).send({ duty, ocurrences })
  } catch (err: unknown) {
    throw err
  }
}
