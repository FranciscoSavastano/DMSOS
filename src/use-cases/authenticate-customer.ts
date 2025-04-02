import type { CustomerRepository } from '@/repositories/customers-repository'
import type { Cliente } from '@prisma/client'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { compare } from 'bcryptjs'
import type { AuthenticationAuditCustomerRepository } from '@/repositories/authentication-audit-repository-customer'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
  ipAddress?: string
  remotePort?: string
  browser?: string
}

interface AuthenticateUseCaseResponse {
  user: Cliente
}

export class AuthenticateCustomerUseCase {
  constructor(
    private readonly authenticationAuditRepository: AuthenticationAuditCustomerRepository,
    private readonly custRepository: CustomerRepository,
  ) {
    console.log('Constructor called');
    console.log('authenticationAuditRepository:', !!this.authenticationAuditRepository);
    console.log('custRepository:', !!this.custRepository);
  }

  async execute({
    email,
    password,
    browser,
    ipAddress,
    remotePort,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    let user
    user = await this.custRepository.findByEmail(email)

    const auditAuthenticateObject = {
      browser: browser ?? null,
      ip_address: ipAddress ?? null,
      remote_port: remotePort ?? null,
      cliente_id: user?.id ?? null,
    }

    if (user == null) {
      await this.authenticationAuditRepository.create({
        ...auditAuthenticateObject,
        status: 'USER_NOT_EXISTS',
      })

      throw new InvalidCredentialsError()
    }

    const doesPasswordMatch = await compare(password, user.password_digest)
    console.log(doesPasswordMatch)
    
    if (!doesPasswordMatch) {
      await this.authenticationAuditRepository.create({
        ...auditAuthenticateObject,
        status: 'INCORRECT_PASSWORD',
      })

      throw new InvalidCredentialsError()
    }

    await this.custRepository.setLastLogin(user.id)

    await this.authenticationAuditRepository.create({
      ...auditAuthenticateObject,
      status: 'SUCCESS',
      cliente_id: user.id,
    })

    return {
      user,
    }
  }
}