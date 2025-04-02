import type { Prisma } from '@prisma/client'
import type { AuthenticationAuditCustomerRepository } from '../authentication-audit-repository-customer'
import { prisma } from '@/lib/prisma'

export class PrismaAuthenticationAuditCustomerRepository
  implements AuthenticationAuditCustomerRepository
{
  async create(data: Prisma.AuthenticationAuditCustomerUncheckedCreateInput) {
    const authenticationAudit = await prisma.authenticationAuditCustomer.create({
      data,
    })

    return authenticationAudit
  }

  async findAll() {
    const authenticationAuditList = await prisma.authenticationAuditCustomer.findMany()

    return authenticationAuditList
  }

  async getLast() {
    const authenticationAudit = await prisma.authenticationAuditCustomer.findMany({
      orderBy: {
        created_at: 'desc',
      },
      take: 1,
    })

    if (authenticationAudit.length === 0) return null

    return authenticationAudit[0]
  }
}
