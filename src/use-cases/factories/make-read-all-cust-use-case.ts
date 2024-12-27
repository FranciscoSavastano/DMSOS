import { PrismaCustsRepository } from '@/repositories/prisma/prisma-custs-repository'
import { ReadAllCustUseCase } from './read-all-cust'

export function makeReadAllCustUseCase() {
  const custsRepository = new PrismaCustsRepository()
  const readAllCustUseCase = new ReadAllCustUseCase(custsRepository)

  return readAllCustUseCase
}
