import type { Prisma, Cliente } from '@prisma/client'

export interface IChangePassword {
  email: string
  password_digest: string
}

export interface IUpdateCust {
  id: string
  data: {
    cnpj?: string
    nome?: string
    user_role?: string
    responsavel?: string
    email?: string
    password_digest?: string
    endereco?: string
    is_new?: boolean
    services?: Array<string>
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
  create: (data: Prisma.ClienteCreateInput) => Promise<Cliente | null>
  read: (id: string) => Promise<Cliente | null>
  readAllCusts: () => Promise<Cliente[]>
  update: (data: IUpdateCust) => Promise<Cliente | null>
  deleteCust: (id: string) => Promise<boolean>
  setLastLogin: (id: string) => Promise<void>
  changePassword: (data: IChangePassword) => Promise<Cliente | null>
}
