import env from "@/config/env"
import { WorkRepository } from "@/repositories/works-repository"
import { DiaObra } from "@prisma/client"
import { verify } from "jsonwebtoken"
import { InvalidJwtTokenError } from "./errors/invalid-jwt-token-error"
import { WorkDayIdNotFoundError } from "./errors/work-day-id-not-found-error"

interface ReadWorkDayUseCaseRequest {
    bearerAuth: string
    id: number
}

interface ReadWorkDayUseCaseResponse {
    workDay: DiaObra
}

export class ReadAllWorkDaysByWIDUseCase {
    constructor(private readonly workRepository: WorkRepository) {}

    async execute({
        bearerAuth,
        id,
    }: ReadWorkDayUseCaseRequest): Promise<ReadWorkDayUseCaseResponse> {
        const token = bearerAuth.split(" ")[1]
        try {
            verify(token, env.JWT_SECRET) as { sub: string }
        } catch (error) {
            throw new InvalidJwtTokenError()
        }

        const workDay = await this.workRepository.readAllWorkDaysByWorkId(id)

        if (!workDay) {
            throw new WorkDayIdNotFoundError()
        }

        return { workDay }
    }
}