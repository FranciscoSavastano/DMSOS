import { PrismaCustomerRepository } from '@/repositories/prisma/prisma-customer-repository'
import { RegisterCustUseCase } from '../register'

export function makeRegisterCustUseCase() {
  const customerRepository = new PrismaCustomerRepository()
  const registerUseCase = new RegisterCustUseCase(customerRepository)

  return registerUseCase
}
