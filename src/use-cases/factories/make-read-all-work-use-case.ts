import { PrismaWorkRepository } from '@/repositories/prisma/prisma-work-repository'
import { ReadAllWorkUseCase } from '../read-all-work'

export function makeReadAllWorkUseCase() {
  const workRepository = new PrismaWorkRepository()
  const readAllWorkUseCase = new ReadAllWorkUseCase(workRepository)

  return readAllWorkUseCase
}
