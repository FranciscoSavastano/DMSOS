import { PrismaDutyRepository } from '@/repositories/prisma/prisma-duty-repository'
import { UpdateDutyUseCase } from './update-duty'

export function makeUpdateDutyUseCase() {
  const dutyRepository = new PrismaDutyRepository()
  const updateDutyUseCase = new UpdateDutyUseCase(dutyRepository)

  return updateDutyUseCase
}
