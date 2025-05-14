import { PrismaWorkRepository } from "@/repositories/prisma/prisma-work-repository"
import { CreateWorkDayUseCase } from "../work-day"

export function makeCreateWorkDayUseCase() {
    const workRepository = new PrismaWorkRepository()
    const createWorkDayUseCase = new CreateWorkDayUseCase(workRepository)
    
    return createWorkDayUseCase
}