import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { ReadUserUseCase } from './read-user'

export function makeReadUserUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const updateUserUseCase = new ReadUserUseCase(usersRepository)

  return updateUserUseCase
}
