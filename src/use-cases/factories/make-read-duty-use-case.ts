import { PrismaDutyRepository } from '@/repositories/prisma/prisma-duty-repository'
import { ReadDutyUseCase } from './read-duty'

export function makeReadDutyUseCase() {
  const dutyRepository = new PrismaDutyRepository()
  const updateDutyUseCase = new ReadDutyUseCase(dutyRepository)

  return updateDutyUseCase
}
