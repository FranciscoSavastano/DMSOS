import type { UsersRepository } from '@/repositories/users-repository'
import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists'
import type { Tecnico } from '@prisma/client'

interface RegisterUseCaseRequest {
  nome: string
  email: string
  cpf: string
  password: string
}

interface RegisterUseCaseResponse {
  user: Tecnico
}

export class RegisterUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    nome,
    cpf,
    email,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail != null) {
      throw new UserAlreadyExistsError()
    }

    const passwordDigest = await hash(password, 10)

    const user = await this.usersRepository.create({
      nome,
      cpf,
      email,
      password_digest: passwordDigest,
    })

    return {
      user,
    }
  }
}
