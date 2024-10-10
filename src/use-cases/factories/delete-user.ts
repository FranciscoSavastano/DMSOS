import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from '../errors/invalid-jwt-token-error'
import { UserEmailNotFoundError } from '../errors/user-email-not-found-error'
import { UserIdNotFoundError } from '../errors/user-id-not-found-error'
import { type UsersRepository } from '@/repositories/users-repository'

interface DeleteUserUseCaseRequest {
  bearerAuth: string
  id: string
}

export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ bearerAuth }: DeleteUserUseCaseRequest): Promise<boolean> {
    const token = bearerAuth.split(' ')[1]
    let token_payload: { sub: string }

    try {
      token_payload = verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const token_user = await this.usersRepository.findById(token_payload.sub)

    if (token_user === null) {
      throw new UserIdNotFoundError()
    }

    return await this.usersRepository.deleteUser(token_user.id)
  }
}
