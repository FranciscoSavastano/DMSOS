import { PrismaDutyRepository } from '@/repositories/prisma/prisma-duty-repository'
import { CreateRevisaoUseCase } from '../revisao'

export function makeCreateSolicitacaoUseCase() {
  const dutyRepository = new PrismaDutyRepository()
  const createRevisaoUseCase = new CreateRevisaoUseCase(dutyRepository)

  return createRevisaoUseCase
}
