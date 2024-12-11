import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { DutyRepository, IUpdateDuty } from '../duties-repository'
import { NotFoundError } from '@prisma/client/runtime/library'

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

  async readAllUserDuties(id: string) {
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id,
        },
      })

      const plantoes = await prisma.plantao.findMany({
        where: {
          operadoresNome: {
            has: user.nome,
          },
        },
      })

      return plantoes
    } catch (err) {
      if (err instanceof NotFoundError) {
        return err.message
      }
    }
    return null
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
