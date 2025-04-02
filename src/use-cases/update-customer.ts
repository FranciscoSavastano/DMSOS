import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import type { CustomerRepository } from '@/repositories/customers-repository'
import type { Cliente } from '@prisma/client'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import { UserEmailNotFoundError } from './errors/user-email-not-found-error'
import { hash } from 'bcryptjs'

interface UpdateUseCaseRequest {
  bearerAuth: string
  nome?: string
  password?: string
  password_digest?: string
  cnpj?: string
  user_role?: string
  responsavel?: string
  email?: string
  endereco?: string
  is_new?: boolean
  services?: Array<string>
}

interface UpdateUseCaseResponse {
  user: Cliente
}

export class UpdateUserUseCase {
  constructor(private readonly usersRepository: CustomerRepository) {}

  async execute({
    bearerAuth,
    password,
    cnpj,
    nome,
    user_role,
    responsavel,
    email,
    endereco,
    is_new,
    services,
  
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
        cnpj,
        nome,
        user_role,
        responsavel,
        email,
        endereco,
        is_new,
        services,
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
