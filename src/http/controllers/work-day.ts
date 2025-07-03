import { makeCreateWorkDayUseCase } from "@/use-cases/factories/make-create-work-day-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createWorkDay(request : FastifyRequest, reply : FastifyReply) {
    //Debug do body
  console.log('Request Body:', request.body);
    const registerBodySchema = z.object({
        obra_id: z.number(),
        data: z.string().datetime(),
        inicio: z.string().datetime(),
        termino: z.string().datetime().optional(),
        horas_gastas: z.number().optional(),
        supervisor_id: z.string(),
        observacao: z.string().optional(),
        equipe: z.string().array().optional(),
        tipo_dia: z.string().optional(),
        
    }).parse(request.body)
    const createWorkHeadersSchema = z
        .object({
            authorization: z.string(),
        })
        .parse(request.headers)
    const { authorization: bearerAuth } = createWorkHeadersSchema
    const {
        obra_id,
        data,
        inicio,
        termino,
        horas_gastas,
        supervisor_id,
        observacao,
        equipe,
      tipo_dia,
    } = registerBodySchema
    try {
        const registerWorkDayCase = makeCreateWorkDayUseCase()
        const { workDay } = await registerWorkDayCase.execute({
            obra_id,
            data,
            inicio,
            termino,
            horas_gastas,
            supervisor_id,
            observacao,
            equipe,
            tipo_dia,
            bearerAuth,
        })
        return reply.status(201).send(workDay)
    } catch (error) {
        if (error instanceof Error) {
            return reply.status(400).send({ message: error.message })
        }
    }
        
}