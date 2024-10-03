import { PrismaDutyRepository } from '@/repositories/prisma/prisma-duty-repository'
import { CreateDutyUseCase } from '../duty'

export function makeCreateDutyUseCase() {
  const dutyRepository = new PrismaDutyRepository()
  const createDutyUseCase = new CreateDutyUseCase(dutyRepository)

  return createDutyUseCase
}
