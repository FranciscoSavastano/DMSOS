import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { ReadAllUserUseCase } from '../read-all-user'

export function makeReadAllUserUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const readAllUserUseCase = new ReadAllUserUseCase(usersRepository)

  return readAllUserUseCase
}
