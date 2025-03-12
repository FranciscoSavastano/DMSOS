import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import type { UsersRepository } from '@/repositories/users-repository'
import type { User } from '@prisma/client'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import { UserEmailNotFoundError } from './errors/user-email-not-found-error'
import { hash } from 'bcryptjs'

interface UpdateUseCaseRequest {
  bearerAuth: string
  nome?: string
  password?: string
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
    password,
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

    // Create update data object without password_digest initially
    const updateData = {
      cpf,
      nome,
      is_admin,
      user_role,
    }

    // Only add password_digest if password is provided
    if (password) {
      updateData.password_digest = await hash(password, 10)
    }

    const token_user = await this.usersRepository.update({
      id: token_payload.sub,
      data: updateData,
    })

    if (token_user === null) {
      throw new UserEmailNotFoundError()
    }

    return { user: token_user }
  }
}
