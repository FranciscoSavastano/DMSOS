import type { Prisma, Cliente } from '@prisma/client'

export interface IChangePassword {
  email: string
  password_digest: string
}

export interface IUpdateCust {
  id: string
  data: {
    cpf?: string
    nome?: string
    is_admin?: boolean
    user_role?: string
  }
}
export interface IChangePassword {
  email: string
  password_digest: string
}

export interface IMakeAdmin {
  email: string
  is_admin: boolean
}

export interface CustomerRepository {
  findByCnpj: (cnpj: string) => Promise<Cliente | null>
  findByEmail: (email: string) => Promise<Cliente | null>
  create: (data: Prisma.ClienteCreateInput) => Promise<Cliente>
  read: (id: string) => Promise<Cliente | null>
  readAllCusts: () => Promise<Cliente[]>
  update: (data: IUpdateCust) => Promise<Cliente | null>
  deleteCust: (id: string) => Promise<boolean>
  setLastLogin: (id: string) => Promise<void>
  changePassword: (data: IChangePassword) => Promise<Cliente | null>
}
