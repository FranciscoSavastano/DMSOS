import { PrismaDutyRepository } from '@/repositories/prisma/prisma-duty-repository'
import { DeleteDutyUseCase } from '../delete-duty'

export function makeDeleteDutyUseCase() {
  const dutyRepository = new PrismaDutyRepository()
  const deleteDutyUseCase = new DeleteDutyUseCase(dutyRepository)

  return deleteDutyUseCase
}
