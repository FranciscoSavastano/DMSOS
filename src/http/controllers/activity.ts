import { makeCreateActivityUseCase} from '@/use-cases/factories/make-create-activity-use-case';
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { string, z } from 'zod';

export async function createActivity(request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z
        .object({
            work_id: z.number(),
            nome: z.string(),
            inicio: z.string().datetime().optional(),
            termino: z.string().datetime().optional(),
            horas_previstas: z.number(),
            materiais: z.string().array(),
            checklist: z.string().array(),
            descricao: z.string().optional(),
        })
        .parse(request.body)
        const createActivityHeadersSchema = z
        .object({
            authorization: z.string(),
        })
        .parse(request.headers)
        const { authorization: bearerAuth } = createActivityHeadersSchema
    const {
        work_id,
        nome,
        inicio,
        termino,
        horas_previstas,
        materiais,
        equipe,
        tipoDias,
        checklist,
        descricao,
    } = registerBodySchema
    try {
        const registerActivityCase = makeCreateActivityUseCase()
        const { activity } = await registerActivityCase.execute({
            work_id,
            nome,
            inicio,
            termino,
            horas_previstas,
            materiais,
            equipe,
            tipoDias,
            checklist,
            descricao,
            bearerAuth,
        })
        return reply.status(201).send({ activity })
    } catch (err) {
        if (err instanceof Error) {
            return reply.status(400).send({ message: err.message })
        }
    }
}