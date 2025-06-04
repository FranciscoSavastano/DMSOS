import { makeCreateActivityWorkDayUseCase } from "@/use-cases/factories/make-create-activity-work-day-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createActivityWorkDay(request: FastifyRequest, reply: FastifyReply) {
    console.log("request body", request.body)
    const createActivityWorkDayBodySchema = z.object({
        activity_id: z.number(),
        work_day_id: z.number(),
        concluidos: z.any().optional(),
        horas_gastas: z.number().optional(), 
    }).parse(request.body);
    const createActivityWorkDayHeadersSchema = z
        .object({
            authorization: z.string(),
        })
        .parse(request.headers);
    const { authorization: bearerAuth } = createActivityWorkDayHeadersSchema;
    const { activity_id, work_day_id, concluidos, horas_gastas } = createActivityWorkDayBodySchema;
    try {
        const createActivityWorkDayUseCase = makeCreateActivityWorkDayUseCase();
        const { activityWorkDay } = await createActivityWorkDayUseCase.execute({
            activity_id,
            work_day_id,
            concluidos,
            horas_gastas,
            bearerAuth,
        });
        return reply.status(201).send(activityWorkDay);
    } catch (error) {
        console.error(error);
        return reply.status(500).send("Internal Server Error");
    }
}