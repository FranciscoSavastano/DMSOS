import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeReadAllWorkDaysUseCase } from "@/use-cases/factories/make-read-all-work-days-use-case";
import { InvalidJwtTokenError } from "@/use-cases/errors/invalid-jwt-token-error";
import { WorkDayIdNotFoundError } from "@/use-cases/errors/work-day-id-not-found-error";

export async function readAllWorkDays(request: FastifyRequest, reply: FastifyReply) {
    const readAllWorkDaysBodySchema = z
        .object({
            id: z.number(),
        })
        .parse(request.body);

    const readAllWorkDaysHeadersSchema = z
        .object({
            authorization: z.string(),
        })
        .parse(request.headers);
    const { id } = readAllWorkDaysBodySchema;
    console.log(id)
    const { authorization: bearerAuth } = readAllWorkDaysHeadersSchema;

    try {
        const readAllWorkDaysUseCase = makeReadAllWorkDaysUseCase();
        const workDay = await readAllWorkDaysUseCase.execute({ bearerAuth, id });

        return await reply.status(200).send({ workDay });
    } catch (err: unknown) {
        if (err instanceof WorkDayIdNotFoundError) {
            return await reply.status(404).send({ message: err.message });
        }

        if (err instanceof InvalidJwtTokenError) {
            return await reply.status(401).send({ message: err.message });
        }

        throw err;
    }
}