import { PrismaDutyRepository } from '@/repositories/prisma/prisma-duty-repository'
import { ReadAllDutyUseCase } from '../read-all-duty'

export function makeReadAllDutyUseCase() {
  const dutyRepository = new PrismaDutyRepository()
  const readAllDutyUseCase = new ReadAllDutyUseCase(dutyRepository)

  return readAllDutyUseCase
}
