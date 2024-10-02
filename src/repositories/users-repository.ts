import type { Prisma, User } from '@prisma/client'

export interface IChangePassword {
  email: string
  password_digest: string
}

export interface IMakeAdmin {
  email: string
  is_admin: boolean
}

export interface UsersRepository {
  findByEmail: (email: string) => Promise<User | null>
  create: (data: Prisma.UserCreateInput) => Promise<User>
  setLastLogin: (id: string) => Promise<void>
  changePassword: (data: IChangePassword) => Promise<User | null>
  makeAdmin: (data: IMakeAdmin) => Promise<User | null>
}
