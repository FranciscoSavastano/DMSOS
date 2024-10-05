import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import type { UsersRepository } from '@/repositories/users-repository'
import { InvalidJwtTokenError } from '../errors/invalid-jwt-token-error'
import type { User } from '@prisma/client'
import { UserIdNotFoundError } from '../errors/user-id-not-found-error'

interface ReadUserUseCaseRequest {
  bearerAuth: string
  id: string
}

interface ReadUserUseCaseResponse {
  user: User
}

export class ReadUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    bearerAuth,
    id,
  }: ReadUserUseCaseRequest): Promise<ReadUserUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]

    try {
      verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const user = await this.usersRepository.read(id)

    if (user === null) {
      throw new UserIdNotFoundError()
    }

    return { user }
  }
}