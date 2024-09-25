import type { Prisma, Tecnico } from '@prisma/client'

export interface IChangePassword {
  email: string
  password_digest: string
}

export interface IMakeAdmin {
  email: string
  is_admin: boolean
}

export interface UsersRepository {
  findByEmail: (email: string) => Promise<Tecnico | null>
  create: (data: Prisma.TecnicoCreateInput) => Promise<Tecnico>
  setLastLogin: (id: string) => Promise<void>
  changePassword: (data: IChangePassword) => Promise<Tecnico | null>
  makeAdmin: (data: IMakeAdmin) => Promise<Tecnico | null>
}
