import { PrismaCustomerRepository } from '@/repositories/prisma/prisma-customer-repository'
import { ReadAllCustUseCase } from './read-all-cust'

export function makeReadAllCustUseCase() {
  const custsRepository = new PrismaCustomerRepository()
  const readAllCustUseCase = new ReadAllCustUseCase(custsRepository)

  return readAllCustUseCase
}
