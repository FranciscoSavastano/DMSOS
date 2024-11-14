import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { DutyRepository, IUpdateDuty } from '../duties-repository'

export class PrismaDutyRepository implements DutyRepository {
  async create(data: Prisma.PlantaoCreateInput) {
    const duty = await prisma.plantao.create({
      data,
    })

    return duty
  }

  async findById(id: number) {
    const duty = await prisma.plantao.findUnique({
      where: {
        id,
      },
      include: {
        operadores: true,
      },
    })
    return duty
  }
  async createOcurrence(data: Prisma.OcorrenciaCreateInput) {
    console.log(ocurrence)
    const ocurrence = await prisma.ocorrencia.create({
      data,
    })

    return ocurrence
  }

  async read(id: number) {
    const duty = await prisma.plantao.findUnique({
      where: {
        id,
      },
      include: {
        operadores: true,
      },
    })
    return duty
  }

  async readAllDuties() {
    const duty = await prisma.plantao.findMany({
      include: {
        operadores: true,
        ocorrencia: true,
      },
    })
    return duty
  }

  async update({ id, data }: IUpdateDuty) {
    const duty = await prisma.plantao.update({
      where: { id },
      data,
      include: {
        operadores: true,
      },
    })
    return duty
  }

  async deleteDuty(id: number) {
    const duty = await prisma.plantao.delete({
      where: {
        id,
      },
      include: {
        operadores: true,
      },
    })
    return true
  }
}
