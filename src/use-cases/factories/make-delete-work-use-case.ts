import { PrismaWorkRepository } from '@/repositories/prisma/prisma-work-repository'
import { DeleteWorkUseCase } from '../delete-work'

export function makeDeleteWorkUseCase() {
  const workRepository = new PrismaWorkRepository()
  const deleteWorkUseCase = new DeleteWorkUseCase(workRepository)

  return deleteWorkUseCase
}
