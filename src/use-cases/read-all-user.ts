import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import type { UsersRepository } from '@/repositories/users-repository'
import type { User } from '@prisma/client'

interface ReadAllUserUseCaseRequest {
  bearerAuth: string
}

interface ReadAllUserUseCaseResponse {
  users: User[]
}

export class ReadAllUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    bearerAuth,
  }: ReadAllUserUseCaseRequest): Promise<ReadAllUserUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]

    try {
      verify(token, env.JWT_SECRET)
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const users = await this.usersRepository.readAllUsers()

    return { users }
  }
}
