import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { OcurrenceTypesRepository } from '../ocurrence-types-repository'

export class PrismaOcurrenceTypeRepository implements OcurrenceTypesRepository {
  async create(data: Prisma.Ocurrence_typesCreateInput) {
    const ocurrence_type = await prisma.ocurrence_types.create({
      data,
    })

    return ocurrence_type
  }

  async findById(id: number) {
    const ocurrence_type = await prisma.ocurrence_types.findUnique({
      where: {
        id,
      },
    })
    return ocurrence_type
  }

  async read(id: number) {
    const ocurrence_type = await prisma.ocurrence_types.findUnique({
      where: {
        id,
      },
    })
    return ocurrence_type
  }

  async readAllOcurrenceType() {
    const ocurrence_type = await prisma.ocurrence_types.findMany({})
    return ocurrence_type
  }

  async deleteOcurrenceType(id: number) {
    const ocurrence_type = await prisma.ocurrence_types.delete({
      where: {
        id,
      },
    })
    return true
  }
}
