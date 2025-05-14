import { makeReadWorkDayUseCase } from "@/use-cases/factories/make-read-work-day";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { InvalidJwtTokenError } from "@/use-cases/errors/invalid-jwt-token-error";
import { WorkDayIdNotFoundError } from "@/use-cases/errors/work-day-id-not-found-error";

export async function readWorkDay(request: FastifyRequest, reply: FastifyReply) {
    const readWorkDayBodySchema = z
        .object({
        id: z.number(),
        })
        .parse(request.body);
    const readWorkDayHeadersSchema = z
        .object({
        authorization: z.string(),
        })
        .parse(request.headers);
    const { id } = readWorkDayBodySchema;
    const { authorization: bearerAuth } = readWorkDayHeadersSchema;
  try {
    const readWorkDayUseCase = makeReadWorkDayUseCase();
    const workDay = await readWorkDayUseCase.execute({ id, bearerAuth });
    
    return await reply.status(200).send({ workDay });
  } catch (err) {
    if (err instanceof WorkDayIdNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof InvalidJwtTokenError) {
      return reply.status(401).send({ message: err.message });
    }
    if (err instanceof Error) {
      return reply.status(400).send({ message: err.message });
    }
  }
    
}