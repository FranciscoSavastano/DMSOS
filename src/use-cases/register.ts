import type { UsersRepository } from '@/repositories/users-repository'
import type { CustomerRepository } from '@/repositories/customers-repository'
import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists'
import type { Cliente, User } from '@prisma/client'
import { CustomerAlreadyExistsError } from './errors/customer-already-exists'
import { UserCpfAlreadyExistsError } from './errors/user-cpf-already-exists'
import { CustomerCnpjAlreadyExistsError } from './errors/cust-cnpj-already-exists'
import { invalid } from 'moment-timezone'
import { InvalidCpf } from './errors/invalid-cpf'

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
    const userWithSameCpf = await this.usersRepository.findByCpf(cpf)
    if (userWithSameEmail != null) {
      throw new UserAlreadyExistsError()
    }
    if (userWithSameCpf != null) {
      throw new UserCpfAlreadyExistsError()
    }

    //Calcular o primeiro digito validador do cpf
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(cpf.charAt(9))) {
      throw new InvalidCpf();
    }

    // Calcular o segundo digito validador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(cpf.charAt(10))) {
      throw new InvalidCpf();
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
    const userWithSameCnpj = await this.customerRepository.findByEmail(cnpj)
    if (userWithSameEmail != null) {
      throw new CustomerAlreadyExistsError()
    }
    if (userWithSameCnpj != null) {
      throw new CustomerCnpjAlreadyExistsError() 
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
