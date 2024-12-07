import { PrismaDutyRepository } from '@/repositories/prisma/prisma-duty-repository'
import { ReadAllUserDutyUseCase } from './read-all-user-duty'

export function makeReadAllUserDutyUseCase() {
  const dutyRepository = new PrismaDutyRepository()
  const readAllDutyUseCase = new ReadAllUserDutyUseCase(dutyRepository)

  return readAllDutyUseCase
}
