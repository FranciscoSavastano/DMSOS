import type { Prisma, Cliente } from '@prisma/client'

export interface IChangePassword {
  email: string
  password_digest: string
}

export interface CustomerRepository {
  findByCnpj: (cnpj: string) => Promise<Cliente | null>
  findByEmail: (email: string) => Promise<Cliente | null>
  create: (data: Prisma.ClienteCreateInput) => Promise<Cliente>
  setLastLogin: (id: string) => Promise<void>
  changePassword: (data: IChangePassword) => Promise<Cliente | null>
}
