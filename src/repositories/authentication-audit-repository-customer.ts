import type { AuthenticationAuditCustomer, Prisma } from '@prisma/client'

export interface AuthenticationAuditCustomerRepository {
  create: (
    data: Prisma.AuthenticationAuditCustomerUncheckedCreateInput,
  ) => Promise<AuthenticationAuditCustomer>
  findAll: () => Promise<AuthenticationAuditCustomer[]>
  getLast: () => Promise<AuthenticationAuditCustomer | null>
}
