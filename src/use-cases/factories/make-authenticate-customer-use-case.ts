import { PrismaCustomerRepository } from '@/repositories/prisma/prisma-customer-repository'
import { AuthenticateCustomerUseCase } from '../authenticate-customer'
import { PrismaAuthenticationAuditCustomerRepository } from '@/repositories/prisma/prisma-authentication-audit-customer-repository'

export function makeAuthenticateCustomerUseCase() {
  const customerRepository = new PrismaCustomerRepository()
  const authenticationAuditRepository = new PrismaAuthenticationAuditCustomerRepository()
  
  const authenticateUseCase = new AuthenticateCustomerUseCase(
    authenticationAuditRepository, 
    customerRepository,             
  )

  return authenticateUseCase
}