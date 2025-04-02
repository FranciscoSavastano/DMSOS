import { PrismaCustomerRepository } from '@/repositories/prisma/prisma-customer-repository'
import { UpdateUserUseCase } from '../update-customer'

export function makeUpdateCustomerUseCase() {
  const usersRepository = new PrismaCustomerRepository()
  const updateUserUseCase = new UpdateUserUseCase(usersRepository)

  return updateUserUseCase
}
