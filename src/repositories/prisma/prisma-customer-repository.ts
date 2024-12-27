import { prisma } from '@/lib/prisma'
import type { Cliente, Prisma } from '@prisma/client'
import type {
  IChangePassword,
  CustomerRepository,
  IUpdateCust,
} from '../customers-repository'

export class PrismaCustomerRepository implements CustomerRepository {
  async findByEmail(email: string) {
    const cust = await prisma.cliente.findUnique({
      where: {
        email,
      },
    })

    return cust
  }
  async findByCnpj(cnpj: string) {
    const cust = await prisma.cliente.findUnique({
      where: {
        cnpj,
      },
    })
    return cust
  }

  async create(data: Prisma.ClienteCreateInput) {
    const cust = await prisma.cliente.create({
      data,
    })

    return cust
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

  async read(id: string) {
    const cust = await prisma.cliente.findUnique({
      where: {
        id,
      },
    })
    return cust
  }

  async readAllCusts(): Promise<Cliente[]> {
    const custs = await prisma.cliente.findMany()
    return custs
  }

  async update({ id, data }: IUpdateCust) {
    const cust = await prisma.cliente.update({
      where: { id },
      data,
    })
    return cust
  }

  async deleteCust(id: string) {
    const cust = await prisma.cliente.delete({
      where: { id },
    })
    return true
  }

  async changePassword({ email, password_digest }: IChangePassword) {
    const cust = await prisma.cliente.update({
      where: { email },
      data: {
        password_digest,
      },
    })

    return cust
  }
}
