import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import type { CustomerRepository } from '@/repositories/customers-repository'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import type { Cliente } from '@prisma/client'
import { UserIdNotFoundError } from './errors/user-id-not-found-error'

interface ReadUserUseCaseRequest {
  bearerAuth: string
  id: string
}

interface ReadUserUseCaseResponse {
  user: Cliente
}

export class ReadCustUseCase {
  constructor(private readonly usersRepository: CustomerRepository) {}

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
