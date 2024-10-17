import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import type { UsersRepository } from '@/repositories/users-repository'
import type { User } from '@prisma/client'
import { InvalidJwtTokenError } from '../errors/invalid-jwt-token-error'
import { UserEmailNotFoundError } from '../errors/user-email-not-found-error'

interface UpdateUseCaseRequest {
  bearerAuth: string
  nome?: string
  cpf?: string
  is_admin?: boolean
  user_role?: string
}

interface UpdateUseCaseResponse {
  user: User
}

export class UpdateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    bearerAuth,
    nome,
    is_admin,
    cpf,
    user_role,
  }: UpdateUseCaseRequest): Promise<UpdateUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]
    let token_payload: { sub: string }

    try {
      token_payload = verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const token_user = await this.usersRepository.update({
      id: token_payload.sub,
      data: {
        cpf,
        nome,
        is_admin,
        user_role,
      },
    })

    if (token_user === null) {
      throw new UserEmailNotFoundError()
    }

    return { user: token_user }
  }
}
