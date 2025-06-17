import { PrismaWorkRepository } from "@/repositories/prisma/prisma-work-repository"
import { UpdateWorkUseCase } from "../update-work"

export function makeUpdateWorkUseCase() {
     const workRepository = new PrismaWorkRepository()
     const updateWorkUseCase = new UpdateWorkUseCase(workRepository)
     
    return updateWorkUseCase
}