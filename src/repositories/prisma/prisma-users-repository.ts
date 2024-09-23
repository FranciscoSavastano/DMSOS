import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { IChangePassword, IMakeAdmin, UsersRepository } from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string) {
    const user = await prisma.tecnico.findUnique({
      where: {
        email,
      },
    })

    return user
  }

  async create(data: Prisma.TecnicoCreateInput) {
    const user = await prisma.tecnico.create({
      data,
    })

    return user
  }

  async setLastLogin(id: string) {
    await prisma.tecnico.update({
      where: {
        id,
      },
      data: {
        last_login: new Date(),
      },
    })
  }

  async changePassword({ email, password_digest }: IChangePassword) {
    const user = await prisma.tecnico.update({
      where: { email },
      data: {
        password_digest,
      },
    })

    return user
  }

  async makeAdmin({email, is_admin}: IMakeAdmin){
    const user = await prisma.tecnico.update({
      where: { email },
      data: {
        is_admin,
      },
    })
    return user
  }
}
