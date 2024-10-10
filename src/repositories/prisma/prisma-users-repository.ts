import { prisma } from '@/lib/prisma'
import type { Prisma, User } from '@prisma/client'
import type {
  IChangePassword,
  IMakeAdmin,
  IUpdateUser,
  UsersRepository,
} from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    return user
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })

    return user
  }

  async read(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }

  async readAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany()
    return users
  }

  async update({ id, data }: IUpdateUser) {
    const user = await prisma.user.update({
      where: { id },
      data,
    })
    return user
  }

  async deleteUser(id: string) {
    const user = await prisma.user.delete({
      where: { id },
    })
    return true
  }
  async setLastLogin(id: string) {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        last_login: new Date(),
      },
    })
  }

  async changePassword({ email, password_digest }: IChangePassword) {
    const user = await prisma.user.update({
      where: { email },
      data: {
        password_digest,
      },
    })

    return user
  }

  async makeAdmin({ email, is_admin }: IMakeAdmin) {
    const user = await prisma.user.update({
      where: { email },
      data: {
        is_admin,
      },
    })
    return user
  }
}
