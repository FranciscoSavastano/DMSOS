import type { UsersRepository } from '@/repositories/users-repository'
import type { CustomerRepository } from '@/repositories/customers-repository'
import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists'
import type { Cliente, User } from '@prisma/client'

interface RegisterUseCaseRequest {
  nome: string
  email: string
  cpf: string
  password: string
  user_role: string
}

interface RegisterUseCaseResponse {
  user: User
}

interface RegisterUseCaseCustRequest {
  nome: string
  email: string
  cnpj: string
  password: string
  telefone?: string
  responsavel?: string
  endereco?: string
}

interface RegisterUseCaseCustResponse {
  user: Cliente
}
export class RegisterUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    nome,
    cpf,
    email,
    password,
    user_role,
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
      user_role,
    })

    return {
      user,
    }
  }
}

export class RegisterCustUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute({
    nome,
    cnpj,
    email,
    password,
  }: RegisterUseCaseCustRequest): Promise<RegisterUseCaseCustResponse> {
    const userWithSameEmail = await this.customerRepository.findByEmail(email)

    if (userWithSameEmail != null) {
      throw new UserAlreadyExistsError()
    }
    const passwordDigest = await hash(password, 10)

    const user = await this.customerRepository.create({
      nome,
      cnpj,
      email,
      password_digest: passwordDigest,
    })

    return {
      user,
    }
  }
}
