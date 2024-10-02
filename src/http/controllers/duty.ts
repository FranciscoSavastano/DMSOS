import { makeCreateDutyUseCase } from '@/use-cases/factories/make-create-duty-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { string, z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z
        .object({
        operator: z.string(),
        date_start: z.string().datetime(),
        date_end: z.string().datetime(),
        rest_hour: z.string().datetime(),
        ocurrence_desc: z.string(),
        ocurrence_pm_hour: z.string().datetime(),
        ocurrence_pm_location: z.string(),
        ocurrence_pm_obs: z.string(),
        ocurrence_pm_action: z.string()
        })
        .parse(request.body)

    const { operator, date_start, date_end, rest_hour, ocurrence_desc, ocurrence_pm_hour, ocurrence_pm_action, ocurrence_pm_location, ocurrence_pm_obs } = registerBodySchema

    try {
        const registerDutyCase = makeCreateDutyUseCase()

        const { duty } = await registerDutyCase.execute({
        operator,
        date_start,
        date_end,
        rest_hour
        })
        await reply.status(201).send(duty)
        if(ocurrence_desc){
            const registerOcurrenceCase = makeCreateOcurrenceUseCase()
            const duty_id = duty.id
            const {ocurrence} = await registerOcurrenceCase.execute({
                duty_id,
                ocurrence_desc,
                ocurrence_pm_hour,
                ocurrence_pm_location,
                ocurrence_pm_obs,
                ocurrence_pm_action
            })
            return await reply.status(201).send(ocurrence)
        }
        return
    } catch (err: unknown) {

        throw err
    }
    }