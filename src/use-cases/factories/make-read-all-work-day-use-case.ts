import { PrismaWorkRepository } from "@/repositories/prisma/prisma-work-repository"
import { ReadAllWorkDayUseCase } from "../read-all-work-day"

export function makeReadAllWorkDayUseCase() {
    const workRepository = new PrismaWorkRepository()
    const createWorkDayUseCase = new ReadAllWorkDayUseCase(workRepository)
    return createWorkDayUseCase
}