import { PrismaWorkRepository } from '@/repositories/prisma/prisma-work-repository'
import { CreateWorkUseCase } from '../work'

export function makeCreateWorkUseCase() {
  const workRepository = new PrismaWorkRepository()
  const createWorkUseCase = new CreateWorkUseCase(workRepository)

  return createWorkUseCase
}
