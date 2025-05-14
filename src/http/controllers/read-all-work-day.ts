import { InvalidJwtTokenError } from "@/use-cases/errors/invalid-jwt-token-error";
import { makeReadAllWorkDayUseCase } from "@/use-cases/factories/make-read-all-work-day-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function readAllWorkDay(request: FastifyRequest, reply: FastifyReply) {
    const readAllWorkDayHeadersSchema = z
        .object({
            authorization: z.string(),
        })
        .parse(request.headers);
    const { authorization: bearerAuth } = readAllWorkDayHeadersSchema;
    try {
        const readAllWorkDayUseCase = makeReadAllWorkDayUseCase();
        const workDays = await readAllWorkDayUseCase.execute({ bearerAuth });
        return await reply.status(200).send({ workDays });
    } catch (err) {
        if (err instanceof InvalidJwtTokenError) {
            return reply.status(401).send({ message: err.message });
        }
        if (err instanceof Error) {
            return reply.status(400).send({ message: err.message });
        }
    }
}