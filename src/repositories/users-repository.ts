import type { Prisma, Tecnico } from '@prisma/client'

export interface IChangePassword {
  email: string
  password_digest: string
}

export interface UsersRepository {
  findByEmail: (email: string) => Promise<Tecnico | null>
  create: (data: Prisma.TecnicoCreateInput) => Promise<Tecnico>
  setLastLogin: (id: string) => Promise<void>
  changePassword: (data: IChangePassword) => Promise<Tecnico | null>
}
