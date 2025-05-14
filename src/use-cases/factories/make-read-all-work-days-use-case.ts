import { PrismaWorkRepository } from "@/repositories/prisma/prisma-work-repository"
import { ReadAllWorkDaysByWIDUseCase } from "../read-work-days"

export function makeReadAllWorkDaysUseCase() {
    const workRepository = new PrismaWorkRepository()
    const readWorkDayUseCase = new ReadAllWorkDaysByWIDUseCase(workRepository)
    
    return readWorkDayUseCase
}