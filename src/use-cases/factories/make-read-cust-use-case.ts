import { PrismaCustomerRepository } from '@/repositories/prisma/prisma-customer-repository'
import { ReadCustUseCase } from '../read-cust'

export function makeReadCustUseCase() {
  const usersRepository = new PrismaCustomerRepository()
  const updateUserUseCase = new ReadCustUseCase(usersRepository)

  return updateUserUseCase
}
