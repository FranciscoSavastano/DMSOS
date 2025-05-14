import { PrismaWorkRepository } from "@/repositories/prisma/prisma-work-repository"
import { ReadWorkDayUseCase } from "../read-work-day"

export function makeReadWorkDayUseCase() {
     const workRepository = new PrismaWorkRepository()
     const createWorkUseCase = new ReadWorkDayUseCase(workRepository)
     
    return createWorkUseCase
}