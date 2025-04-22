import { PrismaWorkRepository } from '@/repositories/prisma/prisma-work-repository'
import { ReadWorkUseCase } from '../read-work'

export function makeReadWorkUseCase() {
  const workRepository = new PrismaWorkRepository()
  const updateWorkUseCase = new ReadWorkUseCase(workRepository)

  return updateWorkUseCase
}
