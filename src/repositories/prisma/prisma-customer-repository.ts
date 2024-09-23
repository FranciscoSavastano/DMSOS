import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { IChangePassword, CustomerRepository } from '../customers-repository'

export class PrismaCustomerRepository implements CustomerRepository {
  async findByEmail(email: string) {
    const user = await prisma.cliente.findUnique({
      where: {
        email,
      },
    })

    return user
  }

  async create(data: Prisma.ClienteCreateInput) {
    const user = await prisma.cliente.create({
      data,
    })

    return user
  }

  async setLastLogin(id: string) {
    await prisma.cliente.update({
      where: {
        id,
      },
      data: {
        last_login: new Date(),
      },
    })
  }

  async changePassword({ email, password_digest }: IChangePassword) {
    const user = await prisma.cliente.update({
      where: { email },
      data: {
        password_digest,
      },
    })

    return user
  }
}
