import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { WorkIdNotFoundError } from '@/use-cases/errors/work-id-not-found-error'
import { makeUpdateWorkUseCase } from '@/use-cases/factories/make-update-work-use-case'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function updateWork(request: FastifyRequest, reply: FastifyReply) {
  const updateWorkBodySchema = z
    .object({
      id: z.number(),
      cliente_id: z.string().optional(),
      gerente_id: z.string().optional(),
      nome: z.string().optional(),
      inicio: z.string().optional(),
      termino: z.string().optional(),
      numproposta: z.string().optional(),
      horas_previstas: z.number().optional(),
      hh_previstas: z.number().optional(),
      tipoDias: z.string().optional(),
      equipe: z.string().array().optional(),
      disciplinas: z.string().array().optional(),
    })
    .parse(request.body)

  const updateWorkHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = updateWorkHeadersSchema

  const {
    id,
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
  } = updateWorkBodySchema

  try {
    const updateWorkUseCase = makeUpdateWorkUseCase()

    const { work } = await updateWorkUseCase.execute({
      id,
      cliente_id,
      gerente_id,
      nome,
      inicio: inicio ? new Date(inicio) : undefined,
      termino: termino ? new Date(termino) : undefined,
      numproposta,
      horas_previstas,
      hh_previstas,
      disciplinas,
      equipe: equipe || [],
      tipoDias,
      bearerAuth,
    })

    return await reply.status(200).send({ work })
  } catch (err: unknown) {
    if (err instanceof WorkIdNotFoundError) {
      return await reply.status(404).send({ message: err.message })
    }

    if (err instanceof InvalidJwtTokenError) {
      return await reply.status(401).send({ message: err.message })
    }

    throw err
  }
}