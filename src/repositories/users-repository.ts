import type { Prisma, User } from '@prisma/client'
import { Nullable } from 'vitest'

export interface IUpdateUser {
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

export interface UsersRepository {
  findByEmail: (email: string) => Promise<User | null>
  findById: (id: string) => Promise<User | null>
  create: (data: Prisma.UserCreateInput) => Promise<User>
  read: (id : string) => Promise<User | null>
  readAllUsers: () => Promise<User[]>
  update: (data: IUpdateUser) => Promise<User | null>
  deleteUser: (id: string) => Promise<boolean>
  setLastLogin: (id: string) => Promise<void>
  changePassword: (data: IChangePassword) => Promise<User | null>
  makeAdmin: (data: IMakeAdmin) => Promise<User | null>
}
